import { tryGetAccount } from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";

import type { RewardDistributorKind } from "./programs/rewardDistributor";
import { findRewardDistributorId } from "./programs/rewardDistributor/pda";
import {
  withClaimRewards,
  withInitRewardDistributor,
  withInitRewardEntry,
  withUpdateRewardEntry,
} from "./programs/rewardDistributor/transaction";
import { ReceiptType } from "./programs/stakePool";
import { getStakeEntry, getStakePool } from "./programs/stakePool/accounts";
import {
  withAuthorizeStakeEntry,
  withClaimReceiptMint,
  withInitStakeEntry,
  withInitStakeMint,
  withInitStakePool,
  withStake,
  withUnstake,
  withUpdateTotalStakeSeconds,
} from "./programs/stakePool/transaction";
import { findStakeEntryIdFromMint } from "./programs/stakePool/utils";
import { getMintSupply } from "./utils";

/**
 * Convenience call to create a stake pool
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param requiresCollections - (Optional) List of required collections pubkeys
 * @param requiresCreators - (Optional) List of required creators pubkeys
 * @param requiresAuthorization - (Optional) Boolean to require authorization
 * @param overlayText - (Optional) Text to overlay on receipt mint tokens
 * @param imageUri - (Optional) Image URI for stake pool
 * @param resetOnStake - (Optional) Boolean to reset an entry's total stake seconds on unstake
 * @param cooldownSeconds - (Optional) Number of seconds for token to cool down before returned to the staker
 * @param rewardDistributor - (Optional) Parameters to creat reward distributor
 * @returns
 */
export const createStakePool = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    rewardDistributor?: {
      rewardMintId: PublicKey;
      rewardAmount?: BN;
      rewardDurationSeconds?: BN;
      rewardDistributorKind?: RewardDistributorKind;
      maxSupply?: BN;
      supply?: BN;
    };
  }
): Promise<[Transaction, PublicKey, PublicKey?]> => {
  const transaction = new Transaction();

  const [, stakePoolId] = await withInitStakePool(
    transaction,
    connection,
    wallet,
    params
  );
  let rewardDistributorId;
  if (params.rewardDistributor) {
    [, rewardDistributorId] = await withInitRewardDistributor(
      transaction,
      connection,
      wallet,
      {
        stakePoolId: stakePoolId,
        rewardMintId: params.rewardDistributor.rewardMintId,
        rewardAmount: params.rewardDistributor.rewardAmount,
        rewardDurationSeconds: params.rewardDistributor.rewardDurationSeconds,
        kind: params.rewardDistributor.rewardDistributorKind,
        maxSupply: params.rewardDistributor.maxSupply,
        supply: params.rewardDistributor.supply,
      }
    );
  }
  return [transaction, stakePoolId, rewardDistributorId];
};

/**
 * Convenience call to create a reward distributor
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param rewardMintId - (Optional) Reward mint id
 * @param rewardAmount - (Optional) Reward amount
 * @param rewardDurationSeconds - (Optional) Reward duration in seconds
 * @param rewardDistributorKind - (Optional) Reward distributor kind Mint or Treasury
 * @param maxSupply - (Optional) Max supply
 * @param supply - (Optional) Supply
 * @returns
 */
export const createRewardDistributor = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
  }
): Promise<[Transaction, PublicKey]> =>
  withInitRewardDistributor(new Transaction(), connection, wallet, params);

/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @returns
 */
export const createStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  return withInitStakeEntry(new Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
};

/**
 * Convenience call to create a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const initializeRewardEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    multiplier?: BN;
  }
): Promise<Transaction> => {
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );

  const transaction = new Transaction();
  if (!stakeEntryData) {
    await withInitStakeEntry(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  }

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  await withInitRewardEntry(transaction, connection, wallet, {
    stakeEntryId: stakeEntryId,
    rewardDistributorId: rewardDistributorId,
  });

  await withUpdateRewardEntry(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    rewardDistributorId: rewardDistributorId,
    stakeEntryId: stakeEntryId,
    multiplier: params.multiplier ?? new BN(1), //TODO default multiplier
  });
  return transaction;
};

/**
 * Convenience call to authorize a stake entry
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const authorizeStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> => {
  return withAuthorizeStakeEntry(new Transaction(), connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
  });
};

/**
 * Convenience call to create a stake entry and a stake mint
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export const createStakeEntryAndStakeMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<[Transaction, PublicKey, Keypair | undefined]> => {
  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    transaction = (
      await createStakeEntry(connection, wallet, {
        stakePoolId: params.stakePoolId,
        originalMintId: params.originalMintId,
      })
    )[0];
  }

  let stakeMintKeypair: Keypair | undefined;
  if (!stakeEntryData?.parsed.stakeMint) {
    stakeMintKeypair = Keypair.generate();
    const stakePool = await getStakePool(connection, params.stakePoolId);

    await withInitStakeMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      stakeMintKeypair,
      name: `POOl${stakePool.parsed.identifier.toString()} RECEIPT`,
      symbol: `POOl${stakePool.parsed.identifier.toString()}`,
    });
  }

  return [transaction, stakeEntryId, stakeMintKeypair];
};

/**
 * Convenience method to claim rewards
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param stakeEntryId - Original mint id
 * @returns
 */
export const claimRewards = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const transaction = new Transaction();

  withUpdateTotalStakeSeconds(transaction, connection, wallet, {
    stakeEntryId: params.stakeEntryId,
    lastStaker: wallet.publicKey,
  });

  await withClaimRewards(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    stakeEntryId: params.stakeEntryId,
  });

  return transaction;
};

/**
 * Convenience method to stake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool id
 * @param originalMintId - Original mint id
 * @param userOriginalMintTokenAccountId - User's original mint token account id
 * @param receiptType - (Optional) ReceiptType to be received back. If none provided, none will be claimed
 * @param user - (Optional) User pubkey in case the person paying for the transaction and
 * stake entry owner are different
 * @param amount - (Optional) Amount of tokens to be staked, defaults to 1
 * @returns
 */
export const stake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    receiptType?: ReceiptType;
    amount?: BN;
  }
): Promise<Transaction> => {
  const supply = await getMintSupply(connection, params.originalMintId);
  if (
    (supply.gt(new BN(1)) || params.amount?.gt(new BN(1))) &&
    params.receiptType === ReceiptType.Original
  ) {
    throw new Error("Fungible with receipt type Original is not supported yet");
  }

  let transaction = new Transaction();
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    [transaction] = await createStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    });
  }

  await withStake(transaction, connection, wallet, {
    stakePoolId: params.stakePoolId,
    originalMintId: params.originalMintId,
    userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
    amount: params.amount,
  });

  if (params.receiptType) {
    const receiptMintId =
      params.receiptType === ReceiptType.Receipt
        ? stakeEntryData?.parsed.stakeMint
        : params.originalMintId;
    if (!receiptMintId) {
      throw new Error(
        "Stake entry has no stake mint. Initialize stake mint first."
      );
    }
    if (
      stakeEntryData?.parsed.stakeMintClaimed ||
      stakeEntryData?.parsed.originalMintClaimed
    ) {
      throw new Error("Receipt has already been claimed.");
    }

    await withClaimReceiptMint(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      receiptMintId: receiptMintId,
      receiptType: params.receiptType,
    });
  }

  return transaction;
};

/**
 * Convenience method to unstake tokens
 * @param connection - Connection to use
 * @param wallet - Wallet to use
 * @param stakePoolId - Stake pool ID
 * @param originalMintId - Original mint ID
 * @returns
 */
export const unstake = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> =>
  withUnstake(new Transaction(), connection, wallet, params);

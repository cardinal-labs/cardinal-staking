import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";

import { getRewardDistributor, getRewardEntry } from "./accounts";
import { RewardDistributorKind } from "./constants";
import {
  claimRewards,
  closeRewardDistributor,
  closeRewardEntry,
  initRewardDistributor,
  initRewardEntry,
  reclaimFunds,
  updateRewardDistributor,
  updateRewardEntry,
} from "./instruction";
import { findRewardDistributorId, findRewardEntryId } from "./pda";
import { withRemainingAccountsForKind } from "./utils";

export const withInitRewardDistributor = async (
  transaction: Transaction,
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
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const remainingAccountsForKind = await withRemainingAccountsForKind(
    transaction,
    connection,
    wallet,
    rewardDistributorId,
    params.kind || RewardDistributorKind.Mint,
    params.rewardMintId
  );
  transaction.add(
    initRewardDistributor(connection, wallet, {
      rewardDistributorId,
      stakePoolId: params.stakePoolId,
      rewardMintId: params.rewardMintId,
      rewardAmount: params.rewardAmount || new BN(1),
      rewardDurationSeconds: params.rewardDurationSeconds || new BN(1),
      kind: params.kind || RewardDistributorKind.Mint,
      remainingAccountsForKind,
      maxSupply: params.maxSupply,
      supply: params.supply,
      defaultMultiplier: params.defaultMultiplier,
      multiplierDecimals: params.multiplierDecimals,
    })
  );
  return [transaction, rewardDistributorId];
};

export const withInitRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    rewardDistributorId: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const [rewardEntryId] = await findRewardEntryId(
    params.rewardDistributorId,
    params.stakeEntryId
  );
  transaction.add(
    initRewardEntry(connection, wallet, {
      stakeEntryId: params.stakeEntryId,
      rewardDistributor: params.rewardDistributorId,
      rewardEntryId: rewardEntryId,
    })
  );
  return [transaction, rewardEntryId];
};

export const withClaimRewards = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );

  if (rewardDistributorData) {
    const rewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      rewardDistributorData.parsed.rewardMint,
      wallet.publicKey,
      wallet.publicKey
    );

    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );

    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorData.pubkey,
      params.stakeEntryId
    );
    const rewardEntryData = await tryGetAccount(() =>
      getRewardEntry(connection, rewardEntryId)
    );

    if (!rewardEntryData) {
      transaction.add(
        initRewardEntry(connection, wallet, {
          stakeEntryId: params.stakeEntryId,
          rewardDistributor: rewardDistributorData.pubkey,
          rewardEntryId: rewardEntryId,
        })
      );
    }

    transaction.add(
      await claimRewards(connection, wallet, {
        stakePoolId: params.stakePoolId,
        stakeEntryId: params.stakeEntryId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        rewardMintTokenAccountId: rewardMintTokenAccountId,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};

export const withCloseRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );

  if (rewardDistributorData) {
    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardDistributorId,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );

    transaction.add(
      await closeRewardDistributor(connection, wallet, {
        stakePoolId: params.stakePoolId,
        rewardMintId: rewardDistributorData.parsed.rewardMint,
        remainingAccountsForKind,
      })
    );
  }
  return transaction;
};

export const withUpdateRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardDistributorId: PublicKey;
    stakeEntryId: PublicKey;
    multiplier: BN;
  }
): Promise<Transaction> => {
  return transaction.add(
    await updateRewardEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      multiplier: params.multiplier,
    })
  );
};

export const withCloseRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );

  return transaction.add(
    closeRewardEntry(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      rewardEntryId: rewardEntryId,
    })
  );
};

export const withUpdateRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  return transaction.add(
    updateRewardDistributor(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      defaultMultiplier: params.defaultMultiplier,
      multiplierDecimals: params.multiplierDecimals,
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
    })
  );
};
export const withReclaimFunds = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    amount: BN;
  }
): Promise<Transaction> => {
  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );
  if (!rewardDistributorData) {
    throw new Error("No reward distrbutor found");
  }

  const rewardDistributorTokenAccountId = await findAta(
    rewardDistributorData.parsed.rewardMint,
    rewardDistributorData.pubkey,
    true
  );

  const authorityTokenAccountId = await findAta(
    rewardDistributorData.parsed.rewardMint,
    wallet.publicKey,
    true
  );

  return transaction.add(
    reclaimFunds(connection, wallet, {
      rewardDistributorId: rewardDistributorId,
      rewardDistributorTokenAccountId: rewardDistributorTokenAccountId,
      authorityTokenAccountId: authorityTokenAccountId,
      authority: wallet.publicKey,
      amount: params.amount,
    })
  );
};

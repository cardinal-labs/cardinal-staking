import type { BN } from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

import type { REWARD_DISTRIBUTOR_PROGRAM } from ".";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import type { RewardDistributorKind } from "./constants";
import { REWARD_MANAGER } from "./constants";
import { findRewardDistributorId, findRewardEntryId } from "./pda";

export const initRewardDistributor = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount: BN;
    rewardDurationSeconds: BN;
    kind: RewardDistributorKind;
    remainingAccountsForKind: AccountMeta[];
    maxSupply?: BN;
    supply?: BN;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.initRewardDistributor(
    {
      rewardAmount: params.rewardAmount,
      rewardDurationSeconds: params.rewardDurationSeconds,
      maxSupply: params.maxSupply || null,
      supply: params.supply || null,
      kind: params.kind,
      defaultMultiplier: params.defaultMultiplier || null,
      multiplierDecimals: params.multiplierDecimals || null,
    },
    {
      accounts: {
        rewardDistributor: params.rewardDistributorId,
        stakePool: params.stakePoolId,
        rewardMint: params.rewardMintId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      remainingAccounts: params.remainingAccountsForKind,
    }
  );
};

export const initRewardEntry = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    rewardDistributor: PublicKey;
    rewardEntryId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  return rewardDistributorProgram.instruction.initRewardEntry({
    accounts: {
      rewardEntry: params.rewardEntryId,
      stakeEntry: params.stakeEntryId,
      rewardDistributor: params.rewardDistributor,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const claimRewards = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    rewardMintId: PublicKey;
    rewardMintTokenAccountId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );

  return rewardDistributorProgram.instruction.claimRewards({
    accounts: {
      rewardEntry: rewardEntryId,
      rewardDistributor: rewardDistributorId,
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      userRewardMintTokenAccount: params.rewardMintTokenAccountId,
      rewardManager: REWARD_MANAGER,
      user: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts: params.remainingAccountsForKind,
  });
};

export const closeRewardDistributor = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    remainingAccountsForKind: AccountMeta[];
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );
  return rewardDistributorProgram.instruction.closeRewardDistributor({
    accounts: {
      rewardDistributor: rewardDistributorId,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      signer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccountsForKind,
  });
};

export const updateRewardEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    multiplier: BN;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const [rewardDistributorId] = await findRewardDistributorId(
    params.stakePoolId
  );

  const [rewardEntryId] = await findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );

  return rewardDistributorProgram.instruction.updateRewardEntry(
    {
      multiplier: params.multiplier,
    },
    {
      accounts: {
        rewardEntry: rewardEntryId,
        rewardDistributor: rewardDistributorId,
        authority: wallet.publicKey,
      },
    }
  );
};

export const closeRewardEntry = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    rewardEntryId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  return rewardDistributorProgram.instruction.closeRewardEntry({
    accounts: {
      rewardDistributor: params.rewardDistributorId,
      rewardEntry: params.rewardEntryId,
      authority: wallet.publicKey,
    },
  });
};

export const updateRewardDistributor = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  return rewardDistributorProgram.instruction.updateRewardDistributor(
    {
      defaultMultiplier: params.defaultMultiplier || null,
      multiplierDecimals: params.multiplierDecimals || null,
      rewardAmount: params.rewardAmount || null,
      rewardDurationSeconds: params.rewardDurationSeconds || null,
    },
    {
      accounts: {
        rewardDistributor: params.rewardDistributorId,
        authority: wallet.publicKey,
      },
    }
  );
};

export const reclaimFunds = (
  connection: Connection,
  wallet: Wallet,
  params: {
    rewardDistributorId: PublicKey;
    rewardDistributorTokenAccountId: PublicKey;
    authorityTokenAccountId: PublicKey;
    authority: PublicKey;
    amount: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  return rewardDistributorProgram.instruction.reclaimFunds(params.amount, {
    accounts: {
      rewardDistributor: params.rewardDistributorId,
      rewardDistributorTokenAccount: params.rewardDistributorTokenAccountId,
      authorityTokenAccount: params.authorityTokenAccountId,
      authority: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
};

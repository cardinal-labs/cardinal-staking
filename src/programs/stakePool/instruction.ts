import { findAta } from "@cardinal/common";
import {
  CRANK_KEY,
  getRemainingAccountsForKind,
  TOKEN_MANAGER_ADDRESS,
  TokenManagerKind,
  TokenManagerState,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import {
  findMintCounterId,
  findTokenManagerAddress,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { MetadataProgram } from "@metaplex-foundation/mpl-token-metadata";
import type { BN } from "@project-serum/anchor";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@saberhq/solana-contrib";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

import type { STAKE_POOL_PROGRAM } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import { ReceiptType } from "./constants";
import { findStakeAuthorizationId } from "./pda";
import { remainingAccountsForInitStakeEntry } from "./utils";

export const initPoolIdentifier = (
  connection: Connection,
  wallet: Wallet,
  params: {
    identifierId: PublicKey;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.initIdentifier({
    accounts: {
      identifier: params.identifierId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const initStakePool = (
  connection: Connection,
  wallet: Wallet,
  params: {
    identifierId: PublicKey;
    stakePoolId: PublicKey;
    requiresCreators: PublicKey[];
    requiresCollections: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText: string;
    imageUri: string;
    authority: PublicKey;
    resetOnStake: boolean;
    cooldownSeconds: number | null;
    minStakeSeconds: number | null;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.initPool(
    {
      overlayText: params.overlayText,
      imageUri: params.imageUri,
      requiresCollections: params.requiresCollections,
      requiresCreators: params.requiresCreators,
      requiresAuthorization: params.requiresAuthorization ?? false,
      authority: params.authority,
      resetOnStake: params.resetOnStake,
      cooldownSeconds: params.cooldownSeconds,
      minStakeSeconds: params.minStakeSeconds,
    },
    {
      accounts: {
        stakePool: params.stakePoolId,
        identifier: params.identifierId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const authorizeStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const [stakeAuthorizationId] = await findStakeAuthorizationId(
    params.stakePoolId,
    params.originalMintId
  );
  return stakePoolProgram.instruction.authorizeMint(params.originalMintId, {
    accounts: {
      stakePool: params.stakePoolId,
      stakeAuthorizationRecord: stakeAuthorizationId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
  });
};

export const initStakeEntry = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const remainingAccounts = await remainingAccountsForInitStakeEntry(
    params.stakePoolId,
    params.originalMintId
  );
  return stakePoolProgram.instruction.initEntry(wallet.publicKey, {
    accounts: {
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      originalMint: params.originalMintId,
      originalMintMetadata: params.originalMintMetadatId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    },
    remainingAccounts,
  });
};

export const initStakeMint = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    originalMintMetadatId: PublicKey;
    stakeEntryStakeMintTokenAccountId: PublicKey;
    stakeMintMetadataId: PublicKey;
    stakeMintId: PublicKey;
    mintManagerId: PublicKey;
    name: string;
    symbol: string;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.initStakeMint(
    { name: params.name, symbol: params.symbol },
    {
      accounts: {
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMintId,
        originalMintMetadata: params.originalMintMetadatId,
        stakeMint: params.stakeMintId,
        stakeMintMetadata: params.stakeMintMetadataId,
        stakeEntryStakeMintTokenAccount:
          params.stakeEntryStakeMintTokenAccountId,
        mintManager: params.mintManagerId,
        payer: wallet.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
        tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
        associatedToken: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMetadataProgram: MetadataProgram.PUBKEY,
        systemProgram: SystemProgram.programId,
      },
    }
  );
};

export const claimReceiptMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    tokenManagerReceiptMintTokenAccountId: PublicKey;
    originalMintId: PublicKey;
    receiptMintId: PublicKey;
    receiptType: ReceiptType;
  }
): Promise<TransactionInstruction> => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const [
    [tokenManagerId],
    [mintCounterId],
    stakeEntryReceiptMintTokenAccountId,
    userReceiptMintTokenAccountId,
    remainingAccounts,
  ] = await Promise.all([
    findTokenManagerAddress(params.receiptMintId),
    findMintCounterId(params.receiptMintId),
    findAta(params.receiptMintId, params.stakeEntryId, true),
    findAta(params.receiptMintId, wallet.publicKey, true),
    getRemainingAccountsForKind(
      params.receiptMintId,
      params.receiptType === ReceiptType.Original
        ? TokenManagerKind.Edition
        : TokenManagerKind.Managed
    ),
  ]);

  return stakePoolProgram.instruction.claimReceiptMint({
    accounts: {
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMintId,
      receiptMint: params.receiptMintId,
      stakeEntryReceiptMintTokenAccount: stakeEntryReceiptMintTokenAccountId,
      user: wallet.publicKey,
      userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
      mintCounter: mintCounterId,
      tokenManager: tokenManagerId,
      tokenManagerReceiptMintTokenAccount:
        params.tokenManagerReceiptMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
    remainingAccounts,
  });
};

export const stake = (
  connection: Connection,
  wallet: Wallet,
  params: {
    originalMint: PublicKey;
    stakeEntryId: PublicKey;
    stakePoolId: PublicKey;
    stakeEntryOriginalMintTokenAccountId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    amount: BN;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  return stakePoolProgram.instruction.stake(params.amount, {
    accounts: {
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccountId,
      originalMint: params.originalMint,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
};

export const unstake = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    stakeEntryOriginalMintTokenAccount: PublicKey;
    userOriginalMintTokenAccount: PublicKey;
    user: PublicKey;
    remainingAccounts: AccountMeta[];
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.unstake({
    accounts: {
      stakePool: params.stakePoolId,
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMintId,
      stakeEntryOriginalMintTokenAccount:
        params.stakeEntryOriginalMintTokenAccount,
      user: params.user,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: params.remainingAccounts,
  });
};

export const updateStakePool = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    requiresCreators?: PublicKey[];
    requiresCollections?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    authority?: PublicKey;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
  }
): TransactionInstruction => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.updatePool(
    {
      overlayText: params.overlayText || "RENTED",
      imageUri: params.imageUri || "",
      requiresCollections: params.requiresCollections || null,
      requiresCreators: params.requiresCreators || null,
      requiresAuthorization: params.requiresAuthorization || false,
      authority: params.authority || null,
      resetOnStake: params.resetOnStake || false,
      cooldownSeconds: params.cooldownSeconds || null,
      minStakeSeconds: params.minStakeSeconds || null,
    },
    {
      accounts: {
        stakePool: params.stakePoolId,
        payer: wallet.publicKey,
      },
    }
  );
};

export const updateTotalStakeSeconds = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakEntryId: PublicKey;
    lastStaker: PublicKey;
  }
) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.updateTotalStakeSeconds({
    accounts: {
      stakeEntry: params.stakEntryId,
      lastStaker: params.lastStaker,
    },
  });
};

export const returnReceiptMint = async (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntry: PublicKey;
    receiptMint: PublicKey;
    tokenManagerKind: TokenManagerKind;
    tokenManagerState: TokenManagerState;
    returnAccounts: AccountMeta[];
  }
) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const [tokenManagerId] = await findTokenManagerAddress(params.receiptMint);
  const tokenManagerTokenAccountId = await findAta(
    params.receiptMint,
    (
      await findTokenManagerAddress(params.receiptMint)
    )[0],
    true
  );

  const userReceiptMintTokenAccount = await findAta(
    params.receiptMint,
    wallet.publicKey,
    true
  );

  const transferAccounts = await getRemainingAccountsForKind(
    params.receiptMint,
    params.tokenManagerKind
  );

  return stakePoolProgram.instruction.returnReceiptMint({
    accounts: {
      stakeEntry: params.stakeEntry,
      receiptMint: params.receiptMint,
      tokenManager: tokenManagerId,
      tokenManagerTokenAccount: tokenManagerTokenAccountId,
      userReceiptMintTokenAccount: userReceiptMintTokenAccount,
      user: wallet.publicKey,
      collector: CRANK_KEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      rent: SYSVAR_RENT_PUBKEY,
    },
    remainingAccounts: [
      ...(params.tokenManagerState === TokenManagerState.Claimed
        ? transferAccounts
        : []),
      ...params.returnAccounts,
    ],
  });
};

export const closeStakePool = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    authority: PublicKey;
  }
) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.closeStakePool({
    accounts: {
      stakePool: params.stakePoolId,
      authority: params.authority,
    },
  });
};

export const closeStakeEntry = (
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    authority: PublicKey;
  }
) => {
  const provider = new AnchorProvider(connection, wallet, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  return stakePoolProgram.instruction.closeStakeEntry({
    accounts: {
      stakePool: params.stakePoolId,
      stakeEntry: params.stakeEntryId,
      authority: params.authority,
    },
  });
};

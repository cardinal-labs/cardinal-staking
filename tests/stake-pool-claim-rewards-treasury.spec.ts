import { findAta } from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import { expectTXTable } from "@saberhq/chai-solana";
import { SolanaProvider, TransactionEnvelope } from "@saberhq/solana-contrib";
import * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { expect } from "chai";

import { rewardDistributor } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";
import { getRewardDistributor } from "../src/programs/rewardDistributor/accounts";
import { findRewardDistributorId } from "../src/programs/rewardDistributor/pda";
import {
  getStakeEntry,
  getStakePool,
} from "../src/programs/stakePool/accounts";
import {
  findStakeEntryIdForPool,
  findStakePoolId,
} from "../src/programs/stakePool/pda";
import {
  withCreateEntry,
  withCreatePool,
  withStake,
  withUnstake,
} from "../src/programs/stakePool/transaction";
import { createMint, delay } from "./utils";
import { getProvider } from "./workspace";

describe("Stake and claim rewards from treasury", () => {
  let poolIdentifier: BN;
  const maxSupply = 100;
  const entryName = "name";
  const symbol = "symbol";
  const overlayText = "staking";
  let originalMint: splToken.Token;
  let rewardMint: splToken.Token;
  let stakePoolId: web3.PublicKey;
  const receiptMintKeypair = web3.Keypair.generate();
  const originalMintAuthority = web3.Keypair.generate();

  before(async () => {
    const provider = getProvider();
    // original mint
    [, originalMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey
    );

    // original mint
    [, rewardMint] = await createMint(
      provider.connection,
      originalMintAuthority,
      provider.wallet.publicKey,
      maxSupply,
      provider.wallet.publicKey
    );
  });

  it("Create Pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();
    [, , poolIdentifier] = await withCreatePool(
      transaction,
      provider.connection,
      provider.wallet,
      {
        overlayText: overlayText,
      }
    );

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );

    await expectTXTable(txEnvelope, "Create pool", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    [stakePoolId] = await findStakePoolId(poolIdentifier);
    const stakePoolData = await getStakePool(provider.connection, stakePoolId);

    expect(stakePoolData.parsed.identifier.toNumber()).to.eq(
      poolIdentifier.toNumber()
    );
  });

  it("Create Reward Distributor", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();
    await rewardDistributor.transaction.withInitRewardDistributor(
      transaction,
      provider.connection,
      provider.wallet,
      {
        stakePoolId: stakePoolId,
        rewardMintId: rewardMint.publicKey,
        kind: RewardDistributorKind.Treasury,
        maxSupply: new BN(maxSupply),
      }
    );

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );

    await expectTXTable(txEnvelope, "Create reward distributor", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.publicKey.toString()
    );
  });

  it("Init Reward Entry", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();
    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    await rewardDistributor.transaction.withInitRewardEntry(
      transaction,
      provider.connection,
      provider.wallet,
      {
        mintId: originalMint.publicKey,
        rewardDistributorId: rewardDistributorId,
      }
    );

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );

    await expectTXTable(txEnvelope, "Init reward entry", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const rewardDistributorData = await getRewardDistributor(
      provider.connection,
      rewardDistributorId
    );

    expect(rewardDistributorData.parsed.rewardMint.toString()).to.eq(
      rewardMint.publicKey.toString()
    );
  });

  it("Init stake entry for pool", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withCreateEntry(transaction, provider.connection, provider.wallet, {
      receiptMintKeypair: receiptMintKeypair,
      stakePoolIdentifier: poolIdentifier,
      originalMint: originalMint.publicKey,
      name: entryName,
      symbol: symbol,
    });

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions],
      [receiptMintKeypair]
    );

    await expectTXTable(txEnvelope, "init stake entry", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [[stakePoolId], [stakeEntryId]] = await Promise.all([
      findStakePoolId(poolIdentifier),
      findStakeEntryIdForPool(poolIdentifier, originalMint.publicKey),
    ]);

    const stakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );

    expect(stakeEntryData.parsed.originalMint.toString()).to.eq(
      originalMint.publicKey.toString()
    );
    expect(stakeEntryData.parsed.pool.toString()).to.eq(stakePoolId.toString());
    expect(stakeEntryData.parsed.receiptMint.toString()).to.eq(
      receiptMintKeypair.publicKey.toString()
    );
  });

  it("Stake", async () => {
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withStake(transaction, provider.connection, provider.wallet, {
      stakePoolIdentifier: poolIdentifier,
      originalMint: originalMint.publicKey,
      receiptMint: receiptMintKeypair.publicKey,
    });

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );
    await expectTXTable(txEnvelope, "stake", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [stakeEntryId] = await findStakeEntryIdForPool(
      poolIdentifier,
      originalMint.publicKey
    );
    const stakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const userMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      provider.wallet.publicKey,
      true
    );

    const stakeEntryOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const stakeEntryMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      stakeEntryData.pubkey,
      true
    );

    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.be.greaterThan(0);
    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      provider.wallet.publicKey.toString()
    );

    const checkMint = new splToken.Token(
      provider.connection,
      receiptMintKeypair.publicKey,
      splToken.TOKEN_PROGRAM_ID,
      web3.Keypair.generate()
    );

    const checkUserMintTokenAccount = await checkMint.getAccountInfo(
      userMintTokenAccountId
    );
    expect(checkUserMintTokenAccount.amount.toNumber()).to.eq(1);

    const checkStakeEntryMintTokenAccount = await checkMint.getAccountInfo(
      stakeEntryMintTokenAccountId
    );
    expect(checkStakeEntryMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(0);

    const checkStakeEntryOriginalMintTokenAccount =
      await originalMint.getAccountInfo(stakeEntryOriginalMintTokenAccountId);
    expect(checkStakeEntryOriginalMintTokenAccount.amount.toNumber()).to.eq(1);
  });

  it("Unstake", async () => {
    await delay(2000);
    const provider = getProvider();
    const transaction = new web3.Transaction();

    await withUnstake(transaction, provider.connection, provider.wallet, {
      stakePoolIdentifier: poolIdentifier,
      originalMint: originalMint.publicKey,
      receiptMint: receiptMintKeypair.publicKey,
    });

    const txEnvelope = new TransactionEnvelope(
      SolanaProvider.init({
        connection: provider.connection,
        wallet: provider.wallet,
        opts: provider.opts,
      }),
      [...transaction.instructions]
    );
    await expectTXTable(txEnvelope, "unstake", {
      verbosity: "error",
      formatLogs: true,
    }).to.be.fulfilled;

    const [stakeEntryId] = await findStakeEntryIdForPool(
      poolIdentifier,
      originalMint.publicKey
    );
    const stakeEntryData = await getStakeEntry(
      provider.connection,
      stakeEntryId
    );

    expect(stakeEntryData.parsed.lastStaker.toString()).to.eq(
      web3.PublicKey.default.toString()
    );
    expect(stakeEntryData.parsed.lastStakedAt.toNumber()).to.gt(0);

    const checkMint = new splToken.Token(
      provider.connection,
      receiptMintKeypair.publicKey,
      splToken.TOKEN_PROGRAM_ID,
      web3.Keypair.generate()
    );

    const userOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const userMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      provider.wallet.publicKey,
      true
    );

    const stakeEntryOriginalMintTokenAccountId = await findAta(
      originalMint.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const stakeEntryMintTokenAccountId = await findAta(
      receiptMintKeypair.publicKey,
      stakeEntryData.pubkey,
      true
    );

    const userRewardMintTokenAccountId = await findAta(
      rewardMint.publicKey,
      provider.wallet.publicKey,
      true
    );

    const checkUserMintTokenAccount = await checkMint.getAccountInfo(
      userMintTokenAccountId
    );
    expect(checkUserMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkStakeEntryMintTokenAccount = await checkMint.getAccountInfo(
      stakeEntryMintTokenAccountId
    );
    expect(checkStakeEntryMintTokenAccount.amount.toNumber()).to.eq(1);

    const checkUserOriginalTokenAccount = await originalMint.getAccountInfo(
      userOriginalMintTokenAccountId
    );
    expect(checkUserOriginalTokenAccount.amount.toNumber()).to.eq(1);

    const checkStakeEntryOriginalMintTokenAccount =
      await originalMint.getAccountInfo(stakeEntryOriginalMintTokenAccountId);
    expect(checkStakeEntryOriginalMintTokenAccount.amount.toNumber()).to.eq(0);

    const checkUserRewardTokenAccount = await rewardMint.getAccountInfo(
      userRewardMintTokenAccountId
    );
    expect(checkUserRewardTokenAccount.amount.toNumber()).greaterThan(1);
  });
});

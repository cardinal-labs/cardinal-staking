import { connectionFor, tryGetAccount } from "@cardinal/common";
import { utils } from "@project-serum/anchor";
import { SignerWallet } from "@saberhq/solana-contrib";
import type { Connection } from "@solana/web3.js";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";

import { executeTransaction } from "../src";
import {
  getRewardDistributor,
  getRewardEntry,
} from "../src/programs/rewardDistributor/accounts";
import {
  findRewardDistributorId,
  findRewardEntryId,
} from "../src/programs/rewardDistributor/pda";
import {
  withInitRewardEntry,
  withUpdateRewardEntry,
} from "../src/programs/rewardDistributor/transaction";
import {
  getActiveStakeEntriesForPool,
  getStakeEntry,
} from "../src/programs/stakePool/accounts";
import { fetchMetadata } from "./getMetadataForPoolTokens";

const wallet = new SignerWallet(
  Keypair.fromSecretKey(utils.bytes.bs58.decode("SECRET_KEY"))
);

const POOL_ID = new PublicKey("POOL_ID");
const CLUSTER = "mainnet";

type UpdateRule = {
  volume?: { volumeUpperBound: number; multiplier: number }[];
  metadata?: { traitType: string; value: string; multiplier: number }[];
};

const UPDATE_RULES: UpdateRule[] = [
  // {
  //   volume: [
  //     { volumeUpperBound: 1, multiplier: 1 },
  //     { volumeUpperBound: 4, multiplier: 3 },
  //     { volumeUpperBound: 7, multiplier: 6 },
  //     { volumeUpperBound: 9, multiplier: 7 },
  //     { volumeUpperBound: 15, multiplier: 10 },
  //     { volumeUpperBound: 29, multiplier: 20 },
  //     { volumeUpperBound: 39, multiplier: 25 },
  //     { volumeUpperBound: 40, multiplier: 30 },
  //   ],
  // },
  {
    // metadata: [{ traitType: "some_trait", value: "value", multiplier: 2 }],
  },
];

const updateMultipliersOnRules = async (
  stakePoolId: PublicKey,
  cluster: string
) => {
  const connection = connectionFor(cluster);

  // get all active stake entries
  const activeStakeEntries = await getActiveStakeEntriesForPool(
    connection,
    stakePoolId
  );

  for (const rule of UPDATE_RULES) {
    // metadata
    if (rule.metadata) {
      console.log("Fetching metadata...");
      const [metadata] = await fetchMetadata(
        connection,
        activeStakeEntries.map((entry) => entry.parsed.originalMint)
      );
      console.log("Constructing multipliers...");
      const metadataLogs: { [multiplier: number]: PublicKey[] } = {};
      for (let index = 0; index < metadata.length; index++) {
        const md = metadata[index]!;
        for (const mdRule of rule.metadata) {
          if (
            md.attributes.find(
              (attr) =>
                attr.trait_type === mdRule.traitType &&
                attr.value === mdRule.value
            )
          ) {
            if (metadataLogs[mdRule.multiplier]) {
              metadataLogs[mdRule.multiplier]!.push(
                activeStakeEntries[index]!.pubkey
              );
            } else {
              metadataLogs[mdRule.multiplier] = [
                activeStakeEntries[index]!.pubkey,
              ];
            }
          }
        }
      }

      for (const [multiplierToSet, entries] of Object.entries(metadataLogs)) {
        if (entries.length > 0) {
          await updateMultiplier(
            connection,
            stakePoolId,
            entries,
            Number(multiplierToSet)
          );
        }
      }
    }
    // volume
    if (rule.volume) {
      const volumeLogs: { [user: string]: PublicKey[] } = {};
      for (const entry of activeStakeEntries) {
        const user = entry.parsed.lastStaker.toString();
        if (volumeLogs[user]) {
          volumeLogs[user]!.push(entry.pubkey);
        } else {
          volumeLogs[user] = [entry.pubkey];
        }

        for (const [_, entries] of Object.entries(volumeLogs)) {
          if (entries.length > 0) {
            // find multiplier for volume
            const volume = entries.length;
            let multiplierToSet = 1;
            for (const volumeRule of rule.volume) {
              multiplierToSet = volumeRule.multiplier;
              if (volume <= volumeRule.volumeUpperBound) {
                break;
              }
            }

            await updateMultiplier(
              connection,
              stakePoolId,
              entries,
              multiplierToSet
            );
          }
        }
      }
    }
  }
};

const updateMultiplier = async (
  connection: Connection,
  stakePoolId: PublicKey,
  stakeEntryIds: PublicKey[],
  multiplier: number
): Promise<void> => {
  // update multipliers
  const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );
  if (!rewardDistributorData) {
    console.log("No reward distributor found");
    return;
  }

  const multiplierToSet =
    multiplier * 10 ** rewardDistributorData.parsed.multiplierDecimals;
  for (const stakeEntryId of stakeEntryIds) {
    const transaction = new Transaction();
    const stakeEntryData = await getStakeEntry(connection, stakeEntryId);
    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorId,
      stakeEntryId
    );
    const rewardEntryData = await tryGetAccount(() =>
      getRewardEntry(connection, rewardEntryId)
    );
    if (!rewardEntryData) {
      await withInitRewardEntry(transaction, connection, wallet, {
        stakeEntryId: stakeEntryId,
        rewardDistributorId: rewardDistributorId,
      });
      console.log("Adding init reward entry instruciton");
    }

    if (
      !rewardEntryData ||
      (rewardEntryData &&
        rewardEntryData.parsed.multiplier.toNumber() !== multiplierToSet)
    ) {
      await withUpdateRewardEntry(transaction, connection, wallet, {
        stakePoolId: stakePoolId,
        rewardDistributorId: rewardDistributorId,
        stakeEntryId: stakeEntryId,
        multiplier: new BN(multiplierToSet),
      });
      console.log(
        `Updating multiplier for mint ${stakeEntryData.parsed.originalMint.toString()} from ${
          rewardEntryData ? rewardEntryData.parsed.multiplier.toString() : "100"
        } to ${multiplierToSet}`
      );
    }

    if (transaction.instructions.length > 0) {
      const txId = await executeTransaction(
        connection,
        wallet,
        transaction,
        {}
      );
      console.log(`Successfully executed transaction ${txId}\n`);
    } else {
      console.log("No instructions provided\n");
    }
  }
};

updateMultipliersOnRules(POOL_ID, CLUSTER).catch((e) => console.log(e));

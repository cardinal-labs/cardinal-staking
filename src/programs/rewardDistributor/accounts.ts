import { Program, Provider } from "@project-serum/anchor";
import type * as web3 from "@solana/web3.js";

import type { AccountData } from "../../utils";
import type { REWARD_DISTRIBUTOR_PROGRAM } from ".";
import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import type { RewardDistributorData, RewardEntryData } from "./constants";

export const getRewardEntry = async (
  connection: web3.Connection,
  rewardEntryId: web3.PublicKey
): Promise<AccountData<RewardEntryData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const parsed = (await rewardDistributorProgram.account.rewardEntry.fetch(
    rewardEntryId
  )) as RewardEntryData;
  return {
    parsed,
    pubkey: rewardEntryId,
  };
};

export const getRewardDistributor = async (
  connection: web3.Connection,
  rewardDistributorId: web3.PublicKey
): Promise<AccountData<RewardDistributorData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );

  const parsed =
    (await rewardDistributorProgram.account.rewardDistributor.fetch(
      rewardDistributorId
    )) as RewardDistributorData;
  return {
    parsed,
    pubkey: rewardDistributorId,
  };
};

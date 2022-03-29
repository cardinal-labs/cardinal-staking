import { Program, Provider } from "@project-serum/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";

import type { AccountData } from "../../utils";
import type { STAKE_POOL_PROGRAM, StakePoolData } from ".";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import type { IdentifierData, StakeEntryData } from "./constants";
import { findIdentifierId } from "./pda";

export const getStakePool = async (
  connection: Connection,
  stakePoolId: PublicKey
): Promise<AccountData<StakePoolData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const parsed = (await stakePoolProgram.account.stakePool.fetch(
    stakePoolId
  )) as StakePoolData;
  return {
    parsed,
    pubkey: stakePoolId,
  };
};

export const getStakePools = async (
  connection: Connection,
  stakePoolIds: PublicKey[]
): Promise<AccountData<StakePoolData>[]> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const stakePools = (await stakePoolProgram.account.stakePool.fetchMultiple(
    stakePoolIds
  )) as StakePoolData[];
  return stakePools.map((tm, i) => ({
    parsed: tm,
    pubkey: stakePoolIds[i]!,
  }));
};

export const getStakeEntry = async (
  connection: Connection,
  stakeEntryId: PublicKey
): Promise<AccountData<StakeEntryData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
  return {
    parsed,
    pubkey: stakeEntryId,
  };
};

export const getStakeEntries = async (
  connection: Connection,
  stakeEntryIds: PublicKey[]
): Promise<AccountData<StakeEntryData>[]> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );

  const stakeEntries = (await stakePoolProgram.account.stakeEntry.fetchMultiple(
    stakeEntryIds
  )) as StakePoolData[];
  return stakeEntries.map((tm, i) => ({
    parsed: tm,
    pubkey: stakeEntryIds[i]!,
  }));
};

export const getPoolIdentifier = async (
  connection: Connection
): Promise<AccountData<IdentifierData>> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new Provider(connection, null, {});
  const stakePoolProgram = new Program<STAKE_POOL_PROGRAM>(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const [identifierId] = await findIdentifierId();
  const parsed = (await stakePoolProgram.account.identifier.fetch(
    identifierId
  )) as IdentifierData;
  return {
    parsed,
    pubkey: identifierId,
  };
};

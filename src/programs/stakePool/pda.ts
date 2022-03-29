import type { BN } from "@project-serum/anchor";
import { utils } from "@project-serum/anchor";
import * as web3 from "@solana/web3.js";

import { STAKE_ENTRY_SEED, STAKE_POOL_ADDRESS, STAKE_POOL_SEED } from ".";
import { IDENTIFIER_SEED } from "./constants";

/**
 * Finds the stake pool id.
 * @returns
 */
export const findStakePoolId = async (
  identifier: BN
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_POOL_SEED),
      identifier.toArrayLike(Buffer, "le", 8),
    ],
    STAKE_POOL_ADDRESS
  );
};

/**
 * Convenience method to find the stake entry id for pool identifier
 * @returns
 */
export const findStakeEntryIdForPool = async (
  stakePoolIdentifier: BN,
  originalMintId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  const [stakePoolId] = await findStakePoolId(stakePoolIdentifier);
  return findStakeEntryId(stakePoolId, originalMintId);
};

/**
 * Finds the stake entry id.
 * @returns
 */
export const findStakeEntryId = async (
  stakePoolId: web3.PublicKey,
  originalMintId: web3.PublicKey
): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(STAKE_ENTRY_SEED),
      stakePoolId.toBuffer(),
      originalMintId.toBuffer(),
    ],
    STAKE_POOL_ADDRESS
  );
};

/**
 * Finds the identifier id.
 * @returns
 */
export const findIdentifierId = async (): Promise<[web3.PublicKey, number]> => {
  return web3.PublicKey.findProgramAddress(
    [utils.bytes.utf8.encode(IDENTIFIER_SEED)],
    STAKE_POOL_ADDRESS
  );
};

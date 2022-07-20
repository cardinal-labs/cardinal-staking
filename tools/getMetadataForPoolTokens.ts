import { getBatchedMultipleAccounts } from "@cardinal/common";
import * as metaplex from "@metaplex-foundation/mpl-token-metadata";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import fetch from "node-fetch";

import { getActiveStakeEntriesForPool } from "../src/programs/stakePool/accounts";
import { connectionFor } from "./connection";

type Metadata = {
  name: string;
  symbol: string;
  description: string;
  seller_fee_basis_points: number;
  image: string;
  external_url: string;
  edition: number;
  attributes: { trait_type: string; value: string }[];
};

const getMetadataForPoolTokens = async (
  cluster: string,
  stakePoolId: PublicKey,
  metadataKeys: string[]
) => {
  const connection = connectionFor(cluster);
  const mintIds = (
    await getActiveStakeEntriesForPool(connection, stakePoolId)
  ).map((entry) => entry.parsed.originalMint);

  // find metadata
  const [metadata, metaplexData] = await fetchMetadata(connection, mintIds);

  if (metadataKeys.length === 0) {
    console.log("No metadataKeys provided, ending...");
    return;
  }

  for (const [i, md] of metadata.entries()) {
    const attrs = md.attributes;
    console.log(`Mint ID: ${Object.keys(metaplexData)[i]!}`);
    for (const attrKey of metadataKeys) {
      const foundAttr = attrs.find((trait) => attrKey === trait.trait_type);
      if (foundAttr) {
        console.log(`${attrKey}: ${foundAttr.value}`);
      } else {
        console.log(`Key ${attrKey} not found for mint`);
      }
    }
    console.log("\n");
  }
};

export const fetchMetadata = async (
  connection: Connection,
  mintIds: PublicKey[]
): Promise<
  [Metadata[], { [mintId: string]: { pubkey: PublicKey; uri: string } }]
> => {
  // lookup metaplex data
  const metaplexIds = await Promise.all(
    mintIds.map(
      async (mint) =>
        (
          await metaplex.MetadataProgram.findMetadataAccount(mint)
        )[0]
    )
  );
  const metaplexAccountInfos = await getBatchedMultipleAccounts(
    connection,
    metaplexIds
  );
  const metaplexData = metaplexAccountInfos.reduce(
    (acc, accountInfo, i) => {
      try {
        const metaplexMintData = metaplex.MetadataData.deserialize(
          accountInfo?.data as Buffer
        ) as metaplex.MetadataData;
        acc[mintIds[i]!.toString()] = {
          pubkey: metaplexIds[i]!,
          uri: metaplexMintData.data.uri,
        };
      } catch (e) {
        console.log("Error desirializing metaplex data");
      }
      return acc;
    },
    {} as {
      [mintId: string]: {
        pubkey: PublicKey;
        uri: string;
      };
    }
  );

  const metadata = await Promise.all(
    Object.values(metaplexData).map((data) =>
      fetch(data.uri).then(async (res) => (await res.json()) as Metadata)
    )
  );
  return [metadata, metaplexData];
};

const metadataKeys: string[] = [];
getMetadataForPoolTokens(
  "mainnet",
  new PublicKey("POOL_ID"),
  metadataKeys
).catch((e) => console.log(e));

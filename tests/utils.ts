import {
  CreateMasterEditionV3,
  CreateMetadataV2,
  Creator,
  DataV2,
  MasterEdition,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { BN } from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pay and create mint and token account
 * @param connection
 * @param creator
 * @returns
 */
export const createMint = async (
  connection: web3.Connection,
  creator: web3.Keypair,
  recipient: web3.PublicKey,
  amount = 1,
  freezeAuthority: web3.PublicKey = recipient,
  mintAuthority: web3.PublicKey = creator.publicKey
): Promise<[web3.PublicKey, splToken.Token]> => {
  const fromAirdropSignature = await connection.requestAirdrop(
    creator.publicKey,
    web3.LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(fromAirdropSignature);
  const mint = await splToken.Token.createMint(
    connection,
    creator,
    mintAuthority,
    freezeAuthority,
    0,
    splToken.TOKEN_PROGRAM_ID
  );
  const tokenAccount = await mint.createAssociatedTokenAccount(recipient);
  if (amount) {
    await mint.mintTo(tokenAccount, creator.publicKey, [], amount);
  }
  return [tokenAccount, mint];
};

export const createMasterEditionIxs = async (
  mintId: web3.PublicKey,
  tokenCreatorId: web3.PublicKey
) => {
  const metadataId = await Metadata.getPDA(mintId);
  const metadataTx = new CreateMetadataV2(
    { feePayer: tokenCreatorId },
    {
      metadata: metadataId,
      metadataData: new DataV2({
        name: "test",
        symbol: "TST",
        uri: "http://test/",
        sellerFeeBasisPoints: 10,
        creators: [
          new Creator({
            address: tokenCreatorId.toBase58(),
            verified: true,
            share: 100,
          }),
        ],
        collection: null,
        uses: null,
      }),
      updateAuthority: tokenCreatorId,
      mint: mintId,
      mintAuthority: tokenCreatorId,
    }
  );

  const masterEditionId = await MasterEdition.getPDA(mintId);
  const masterEditionTx = new CreateMasterEditionV3(
    { feePayer: tokenCreatorId },
    {
      edition: masterEditionId,
      metadata: metadataId,
      updateAuthority: tokenCreatorId,
      mint: mintId,
      mintAuthority: tokenCreatorId,
      maxSupply: new BN(1),
    }
  );
  return [...metadataTx.instructions, ...masterEditionTx.instructions];
};

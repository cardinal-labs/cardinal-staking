export type CardinalStakePool = {
  "version": "0.0.0",
  "name": "cardinal_stake_pool",
  "instructions": [
    {
      "name": "initPool",
      "accounts": [
        {
          "name": "stakePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "identifier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitPoolIx"
          }
        }
      ]
    },
    {
      "name": "initEntry",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "originalMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMintMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiptMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiptMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitEntryIx"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiptMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManagerMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintCounter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManagerMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "stakeEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "originalMint",
            "type": "publicKey"
          },
          {
            "name": "receiptMint",
            "type": "publicKey"
          },
          {
            "name": "totalStakeSeconds",
            "type": "i64"
          },
          {
            "name": "lastStakedAt",
            "type": "i64"
          },
          {
            "name": "lastStaker",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "stakePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "identifier",
            "type": "u64"
          },
          {
            "name": "allowedCreators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "allowedCollections",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "overlayText",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "identifier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InitPoolIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "identifier",
            "type": "u64"
          },
          {
            "name": "overlayText",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "allowedCollections",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "allowedCreators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidOriginalMint"
          },
          {
            "name": "InvalidTokenManagerMint"
          },
          {
            "name": "InvalidUserOriginalMintTokenAccount"
          },
          {
            "name": "InvalidUserMintTokenAccount"
          },
          {
            "name": "InvalidStakeEntryOriginalMintTokenAccount"
          },
          {
            "name": "InvalidStakeEntryMintTokenAccount"
          },
          {
            "name": "InvalidUnstakeUser"
          },
          {
            "name": "InvalidStakePool"
          },
          {
            "name": "NoMintMetadata"
          },
          {
            "name": "MintNotAllowedInPool"
          },
          {
            "name": "InvalidPoolAuthority"
          }
        ]
      }
    }
  ]
};

export const IDL: CardinalStakePool = {
  "version": "0.0.0",
  "name": "cardinal_stake_pool",
  "instructions": [
    {
      "name": "initPool",
      "accounts": [
        {
          "name": "stakePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "identifier",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitPoolIx"
          }
        }
      ]
    },
    {
      "name": "initEntry",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "originalMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMintMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "receiptMint",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mintManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiptMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMetadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ix",
          "type": {
            "defined": "InitEntryIx"
          }
        }
      ]
    },
    {
      "name": "stake",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "originalMintMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "receiptMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManagerMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintCounter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedToken",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "unstake",
      "accounts": [
        {
          "name": "stakeEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManager",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakeEntryReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userOriginalMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userReceiptMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenManagerMintAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenManagerProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "stakeEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "pool",
            "type": "publicKey"
          },
          {
            "name": "originalMint",
            "type": "publicKey"
          },
          {
            "name": "receiptMint",
            "type": "publicKey"
          },
          {
            "name": "totalStakeSeconds",
            "type": "i64"
          },
          {
            "name": "lastStakedAt",
            "type": "i64"
          },
          {
            "name": "lastStaker",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "stakePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "identifier",
            "type": "u64"
          },
          {
            "name": "allowedCreators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "allowedCollections",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "overlayText",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "identifier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "InitPoolIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "identifier",
            "type": "u64"
          },
          {
            "name": "overlayText",
            "type": "string"
          },
          {
            "name": "imageUri",
            "type": "string"
          },
          {
            "name": "allowedCollections",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "allowedCreators",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "InvalidOriginalMint"
          },
          {
            "name": "InvalidTokenManagerMint"
          },
          {
            "name": "InvalidUserOriginalMintTokenAccount"
          },
          {
            "name": "InvalidUserMintTokenAccount"
          },
          {
            "name": "InvalidStakeEntryOriginalMintTokenAccount"
          },
          {
            "name": "InvalidStakeEntryMintTokenAccount"
          },
          {
            "name": "InvalidUnstakeUser"
          },
          {
            "name": "InvalidStakePool"
          },
          {
            "name": "NoMintMetadata"
          },
          {
            "name": "MintNotAllowedInPool"
          },
          {
            "name": "InvalidPoolAuthority"
          }
        ]
      }
    }
  ]
};

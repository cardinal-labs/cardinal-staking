export type CardinalRewardDistributor = {
  "version": "0.0.0",
  "name": "cardinal_reward_distributor",
  "instructions": [
    {
      "name": "initRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
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
            "defined": "InitRewardDistributorIx"
          }
        }
      ]
    },
    {
      "name": "initRewardEntry",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": false,
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
            "defined": "InitRewardEntryIx"
          }
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
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
      "name": "reopen",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "rewardEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "rewardDistributor",
            "type": "publicKey"
          },
          {
            "name": "rewardSecondsReceived",
            "type": "u64"
          },
          {
            "name": "rewardAmountReceievd",
            "type": "u64"
          },
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardDistributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakePool",
            "type": "publicKey"
          },
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u64"
          },
          {
            "name": "rewardsIssued",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "closed",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "maxSupply",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "InitRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "multipler",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multipler",
            "type": "u64"
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
            "name": "InvalidTokenAccount"
          },
          {
            "name": "InvalidRewardMint"
          },
          {
            "name": "InvalidUserRewardMintTokenAccount"
          },
          {
            "name": "InvalidRewardDistributor"
          },
          {
            "name": "InvalidRewardDistributorAuthority"
          },
          {
            "name": "InvalidRewardDistributorKind"
          },
          {
            "name": "MaxSupplyRequired"
          },
          {
            "name": "InvalidAuthority"
          },
          {
            "name": "InvalidPoolDistributor"
          },
          {
            "name": "DistributorNotClosed"
          },
          {
            "name": "DistributorAlreadyClosed"
          }
        ]
      }
    },
    {
      "name": "RewardDistributorKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Mint"
          },
          {
            "name": "Treasury"
          }
        ]
      }
    }
  ]
};

export const IDL: CardinalRewardDistributor = {
  "version": "0.0.0",
  "name": "cardinal_reward_distributor",
  "instructions": [
    {
      "name": "initRewardDistributor",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
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
            "defined": "InitRewardDistributorIx"
          }
        }
      ]
    },
    {
      "name": "initRewardEntry",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": false,
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
            "defined": "InitRewardEntryIx"
          }
        }
      ]
    },
    {
      "name": "claimRewards",
      "accounts": [
        {
          "name": "rewardEntry",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributor",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakeEntry",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userRewardMintTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
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
      "name": "reopen",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "rewardDistributor",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakePool",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardDistributorTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorityTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "rewardEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "rewardDistributor",
            "type": "publicKey"
          },
          {
            "name": "rewardSecondsReceived",
            "type": "u64"
          },
          {
            "name": "rewardAmountReceievd",
            "type": "u64"
          },
          {
            "name": "multiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "rewardDistributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "stakePool",
            "type": "publicKey"
          },
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "rewardMint",
            "type": "publicKey"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u64"
          },
          {
            "name": "rewardsIssued",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "closed",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitRewardDistributorIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rewardAmount",
            "type": "u64"
          },
          {
            "name": "rewardDurationSeconds",
            "type": "u64"
          },
          {
            "name": "kind",
            "type": "u8"
          },
          {
            "name": "maxSupply",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "InitRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "multipler",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UpdateRewardEntryIx",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "multipler",
            "type": "u64"
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
            "name": "InvalidTokenAccount"
          },
          {
            "name": "InvalidRewardMint"
          },
          {
            "name": "InvalidUserRewardMintTokenAccount"
          },
          {
            "name": "InvalidRewardDistributor"
          },
          {
            "name": "InvalidRewardDistributorAuthority"
          },
          {
            "name": "InvalidRewardDistributorKind"
          },
          {
            "name": "MaxSupplyRequired"
          },
          {
            "name": "InvalidAuthority"
          },
          {
            "name": "InvalidPoolDistributor"
          },
          {
            "name": "DistributorNotClosed"
          },
          {
            "name": "DistributorAlreadyClosed"
          }
        ]
      }
    },
    {
      "name": "RewardDistributorKind",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Mint"
          },
          {
            "name": "Treasury"
          }
        ]
      }
    }
  ]
};

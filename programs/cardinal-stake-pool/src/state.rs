use anchor_lang::prelude::*;
use std::str::FromStr;

pub const STAKE_ENTRY_PREFIX: &str = "stake-entry";
pub const STAKE_ENTRY_SIZE: usize = 8 + std::mem::size_of::<StakeEntry>() + 64;

pub const STAKE_POOL_PREFIX: &str = "stake-pool";
// max 4 pubkeys and 256 for strings
pub const STAKE_POOL_SIZE: usize = 8 + std::mem::size_of::<StakePool>() + 256;

pub const IDENTIFIER_PREFIX: &str = "identifier";
pub const IDENTIFIER_SIZE: usize = 8 + std::mem::size_of::<Identifier>() + 8;

#[account]
pub struct StakeEntry {
    pub bump: u8,
    pub pool: Pubkey,
    pub original_mint: Pubkey,
    pub receipt_mint: Pubkey,
    pub total_stake_seconds: i64,
    pub last_staked_at: i64,
    pub last_staker: Pubkey,
}

#[account]
pub struct StakePool {
    pub bump: u8,
    pub identifier: u64,
    pub allowed_creators: Vec<Pubkey>,
    pub allowed_collections: Vec<Pubkey>,
    pub overlay_text: String,
    pub image_uri: String,
    pub authority: Pubkey,
}

#[account]
pub struct Identifier {
    pub bump: u8,
    pub count: u64,
}

pub fn is_authority(key: &Pubkey) -> bool {
    *key == Pubkey::from_str("crdk1Mw5WzoVNgz8RgHJXzHdwSrJvp4UcGirvtJzB6U").unwrap()
}

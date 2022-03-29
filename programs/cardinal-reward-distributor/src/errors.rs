use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid token account")]
    InvalidTokenAccount,
    #[msg("Invalid reward mint")]
    InvalidRewardMint,
    #[msg("Invalid user reward mint token account")]
    InvalidUserRewardMintTokenAccount,
    #[msg("Invalid reward distributor")]
    InvalidRewardDistributor,
    #[msg("Invalid reward distributor authority")]
    InvalidRewardDistributorAuthority,
    #[msg("Invalid reward distributor kind")]
    InvalidRewardDistributorKind,
    #[msg("Max supply required for kind treasury")]
    MaxSupplyRequired,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Invalid distributor for pool")]
    InvalidPoolDistributor,
    #[msg("Distributor is already open")]
    DistributorNotClosed,
    #[msg("Distributor is already closed")]
    DistributorAlreadyClosed,
}

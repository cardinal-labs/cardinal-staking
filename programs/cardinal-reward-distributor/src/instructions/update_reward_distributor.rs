use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateRewardDistributorIx {
    pub default_multiplier: Option<u64>,
    pub multiplier_decimals: Option<u8>,
    pub reward_amount: Option<u64>,
    pub reward_duration_seconds: Option<u128>,
}

#[derive(Accounts)]
#[instruction(ix: UpdateRewardDistributorIx)]
pub struct UpdateRewardDistributorCtx<'info> {
    #[account(mut)]
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    #[account(constraint = authority.key() == reward_distributor.authority @ ErrorCode::InvalidRewardDistributorAuthority)]
    authority: Signer<'info>,
}

pub fn handler(ctx: Context<UpdateRewardDistributorCtx>, ix: UpdateRewardDistributorIx) -> Result<()> {
    let reward_distributor = &mut ctx.accounts.reward_distributor;
    reward_distributor.default_multiplier = ix.default_multiplier.unwrap_or(reward_distributor.default_multiplier);
    reward_distributor.multiplier_decimals = ix.multiplier_decimals.unwrap_or(reward_distributor.multiplier_decimals);
    reward_distributor.reward_amount = ix.reward_amount.unwrap_or(reward_distributor.reward_amount);
    reward_distributor.reward_duration_seconds = ix.reward_duration_seconds.unwrap_or(reward_distributor.reward_duration_seconds);
    Ok(())
}

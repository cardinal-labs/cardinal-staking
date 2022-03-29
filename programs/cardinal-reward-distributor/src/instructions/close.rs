use {
    crate::{errors::ErrorCode, state::*},
    anchor_lang::prelude::*,
    anchor_spl::token::{self, Mint, SetAuthority, Token, TokenAccount},
    cardinal_stake_pool::state::StakePool,
    spl_token::instruction::AuthorityType,
};

#[derive(Accounts)]
pub struct CloseCtx<'info> {
    #[account(mut, constraint = reward_distributor.stake_pool == stake_pool.key())]
    reward_distributor: Box<Account<'info, RewardDistributor>>,
    stake_pool: Box<Account<'info, StakePool>>,

    #[account(mut)]
    reward_mint: Box<Account<'info, Mint>>,
    reward_distributor_token_account: Box<Account<'info, TokenAccount>>,
    authority_token_account: Box<Account<'info, TokenAccount>>,

    #[account(mut, constraint = signer.key() == stake_pool.authority @ErrorCode::InvalidAuthority)]
    signer: Signer<'info>,

    token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CloseCtx>) -> Result<()> {
    let reward_distributor = &mut ctx.accounts.reward_distributor;
    if reward_distributor.closed {
        return Err(error!(ErrorCode::DistributorAlreadyClosed));
    }

    match reward_distributor.kind {
        k if k == RewardDistributorKind::Mint as u8 => {
            let cpi_accounts = SetAuthority {
                account_or_mint: reward_distributor.to_account_info(),
                current_authority: ctx.accounts.signer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::set_authority(cpi_context, AuthorityType::MintTokens, Some(ctx.accounts.reward_mint.key()))?;
        }
        k if k == RewardDistributorKind::Treasury as u8 => {
            // give back remaining tokens from max supply
            let remaining_tokens = ctx.accounts.reward_distributor_token_account.amount;
            let reward_distributor_token_account = &mut ctx.accounts.reward_distributor_token_account;
            let authority_token_account = &mut ctx.accounts.authority_token_account;

            let cpi_accounts = token::Transfer {
                from: authority_token_account.to_account_info(),
                to: reward_distributor_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_context, remaining_tokens)?;
        }
        _ => return Err(error!(ErrorCode::InvalidRewardDistributorKind)),
    }

    ctx.accounts.reward_distributor.closed = true;
    Ok(())
}

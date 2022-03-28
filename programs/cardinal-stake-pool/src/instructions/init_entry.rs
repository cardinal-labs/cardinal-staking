use {
    crate::state::*,
    anchor_lang::{
        prelude::*,
        solana_program::program::{invoke, invoke_signed},
    },
    anchor_spl::{
        associated_token::{self, AssociatedToken},
        token::{self, Mint, Token},
    },
    cardinal_token_manager::{self, program::CardinalTokenManager},
    mpl_token_metadata::state::{Creator, Metadata},
    mpl_token_metadata::{self, instruction::create_metadata_accounts_v2},
    solana_program::{program_pack::Pack, system_instruction::create_account},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitEntryIx {
    name: String,
    symbol: String,
}

#[derive(Accounts)]
#[instruction(ix: InitEntryIx)]
pub struct InitEntryCtx<'info> {
    #[account(
        init,
        payer = payer,
        space = STAKE_ENTRY_SIZE,
        seeds = [STAKE_ENTRY_PREFIX.as_bytes(), stake_pool.key().as_ref(), original_mint.key().as_ref()],
        bump,
    )]
    stake_entry: Box<Account<'info, StakeEntry>>,
    #[account(mut)]
    stake_pool: Box<Account<'info, StakePool>>,

    original_mint: Box<Account<'info, Mint>>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    original_mint_metadata: AccountInfo<'info>,
    #[account(mut)]
    receipt_mint: Signer<'info>,

    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    mint_manager: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    stake_entry_receipt_mint_token_account: UncheckedAccount<'info>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    receipt_mint_metadata: UncheckedAccount<'info>,

    #[account(mut, constraint = payer.key() == stake_pool.authority)]
    payer: Signer<'info>,
    rent: Sysvar<'info, Rent>,
    token_program: Program<'info, Token>,
    token_manager_program: Program<'info, CardinalTokenManager>,
    associated_token: Program<'info, AssociatedToken>,
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(address = mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitEntryCtx>, ix: InitEntryIx) -> Result<()> {
    let stake_entry = &mut ctx.accounts.stake_entry;
    stake_entry.bump = *ctx.bumps.get("stake_entry").unwrap();
    stake_entry.pool = ctx.accounts.stake_pool.key();
    stake_entry.original_mint = ctx.accounts.original_mint.key();
    stake_entry.receipt_mint = ctx.accounts.receipt_mint.key();

    let stake_pool_identifier = ctx.accounts.stake_pool.identifier.to_le_bytes();
    let stake_pool_seeds = &[STAKE_POOL_PREFIX.as_bytes(), stake_pool_identifier.as_ref(), &[ctx.accounts.stake_pool.bump]];
    let stake_pool_signer = &[&stake_pool_seeds[..]];

    // create mint
    invoke(
        &create_account(
            ctx.accounts.payer.key,
            ctx.accounts.receipt_mint.key,
            ctx.accounts.rent.minimum_balance(spl_token::state::Mint::LEN),
            spl_token::state::Mint::LEN as u64,
            &spl_token::id(),
        ),
        &[ctx.accounts.payer.to_account_info(), ctx.accounts.receipt_mint.to_account_info()],
    )?;

    // Initialize mint
    let cpi_accounts = token::InitializeMint {
        mint: ctx.accounts.receipt_mint.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    token::initialize_mint(cpi_context, 0, &ctx.accounts.stake_pool.key(), Some(&ctx.accounts.stake_pool.key()))?;

    // create associated token account for stake_entry
    let cpi_accounts = associated_token::Create {
        payer: ctx.accounts.payer.to_account_info(),
        associated_token: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        authority: stake_entry.to_account_info(),
        mint: ctx.accounts.receipt_mint.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts);
    associated_token::create(cpi_context)?;

    // create metadata
    let mut metadata_uri_param: String = "".to_string();
    if !ctx.accounts.original_mint_metadata.data_is_empty() {
        let original_mint_metadata = Metadata::from_account_info(&ctx.accounts.original_mint_metadata.to_account_info())?;
        metadata_uri_param = "&uri=".to_string() + original_mint_metadata.data.uri.trim_matches(char::from(0));
    }
    // TODO use image?
    // let image_uri = ctx.accounts.stake_pool.image_uri.clone();
    invoke_signed(
        &create_metadata_accounts_v2(
            *ctx.accounts.token_metadata_program.key,
            *ctx.accounts.receipt_mint_metadata.key,
            *ctx.accounts.receipt_mint.key,
            ctx.accounts.stake_pool.key(),
            *ctx.accounts.payer.key,
            ctx.accounts.stake_pool.key(),
            ix.name,
            ix.symbol,
            // generative URL which will include image of the name with expiration data
            "https://api.cardinal.so/metadata/".to_string() + &ctx.accounts.receipt_mint.key().to_string() + "?text=" + &ctx.accounts.stake_pool.overlay_text + &metadata_uri_param,
            Some(vec![
                Creator {
                    address: ctx.accounts.stake_pool.key(),
                    verified: true,
                    share: 50,
                },
                Creator {
                    address: stake_entry.key(),
                    verified: false,
                    share: 50,
                },
            ]),
            1,
            true,
            true,
            None,
            None,
        ),
        &[
            ctx.accounts.receipt_mint_metadata.to_account_info(),
            ctx.accounts.receipt_mint.to_account_info(),
            ctx.accounts.stake_pool.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.stake_pool.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
        ],
        stake_pool_signer,
    )?;

    // mint single token to token manager mint token account
    let cpi_accounts = token::MintTo {
        mint: ctx.accounts.receipt_mint.to_account_info(),
        to: ctx.accounts.stake_entry_receipt_mint_token_account.to_account_info(),
        authority: ctx.accounts.stake_pool.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(stake_pool_signer);
    token::mint_to(cpi_context, 1)?;

    // init mint manager
    let token_manager_program = ctx.accounts.token_manager_program.to_account_info();
    let cpi_accounts = cardinal_token_manager::cpi::accounts::CreateMintManagerCtx {
        mint_manager: ctx.accounts.mint_manager.to_account_info(),
        mint: ctx.accounts.receipt_mint.to_account_info(),
        freeze_authority: ctx.accounts.stake_pool.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(token_manager_program, cpi_accounts).with_signer(stake_pool_signer);
    cardinal_token_manager::cpi::create_mint_manager(cpi_ctx)?;

    Ok(())
}
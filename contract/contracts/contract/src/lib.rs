#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contracttype]
#[derive(Clone)]
pub struct Campaign {
    pub organizer: Address,
    pub amount_per_recipient: i128,
    pub deadline: u64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct Recipient {
    pub wallet: Address,
    pub amount: i128,
    pub claimed: bool,
}

#[contracttype]
pub enum DataKey {
    Campaign(String),
    Recipient(String, String),
}

#[contract]
pub struct ReRail;

#[contractimpl]
impl ReRail {
    pub fn create_campaign(
        env: Env,
        organizer: Address,
        campaign_id: String,
        amount_per_recipient: i128,
        deadline: u64,
    ) {
        organizer.require_auth();
        let campaign = Campaign { organizer, amount_per_recipient, deadline, active: true };
        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);
    }

    pub fn add_recipient(
        env: Env,
        organizer: Address,
        campaign_id: String,
        recipient_id: String,
        wallet: Address,
        amount: i128,
    ) {
        organizer.require_auth();
        let campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id.clone()))
            .expect("campaign not found");
        assert_eq!(campaign.organizer, organizer, "not authorized");
        let recipient = Recipient { wallet, amount, claimed: false };
        env.storage().instance().set(&DataKey::Recipient(campaign_id, recipient_id), &recipient);
    }

    pub fn claim(
        env: Env,
        campaign_id: String,
        recipient_id: String,
        claimant: Address,
    ) {
        claimant.require_auth();
        let mut recipient: Recipient = env.storage().instance()
            .get(&DataKey::Recipient(campaign_id.clone(), recipient_id.clone()))
            .expect("recipient not found");
        assert_eq!(recipient.wallet, claimant, "not the intended recipient");
        assert!(!recipient.claimed, "already claimed");
        recipient.claimed = true;
        env.storage().instance().set(&DataKey::Recipient(campaign_id, recipient_id), &recipient);
    }

    pub fn close_campaign(env: Env, organizer: Address, campaign_id: String) {
        organizer.require_auth();
        let mut campaign: Campaign = env.storage().instance()
            .get(&DataKey::Campaign(campaign_id.clone()))
            .expect("campaign not found");
        assert_eq!(campaign.organizer, organizer, "not authorized");
        campaign.active = false;
        env.storage().instance().set(&DataKey::Campaign(campaign_id), &campaign);
    }

    pub fn get_campaign(env: Env, campaign_id: String) -> Campaign {
        env.storage().instance()
            .get(&DataKey::Campaign(campaign_id))
            .expect("campaign not found")
    }

    pub fn is_claimed(env: Env, campaign_id: String, recipient_id: String) -> bool {
        let recipient: Recipient = env.storage().instance()
            .get(&DataKey::Recipient(campaign_id, recipient_id))
            .expect("recipient not found");
        recipient.claimed
    }
}

mod test;

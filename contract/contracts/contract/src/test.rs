#![cfg(test)]
use super::*;
use soroban_sdk::{Env, String, Address};
use soroban_sdk::testutils::Address as _;

#[test]
fn test_create_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");

    client.create_campaign(&organizer, &campaign_id, &1000i128, &1000000u64);

    let campaign = client.get_campaign(&campaign_id);
    assert_eq!(campaign.organizer, organizer);
    assert_eq!(campaign.amount_per_recipient, 1000);
    assert_eq!(campaign.deadline, 1000000);
    assert!(campaign.active);
}

#[test]
fn test_add_recipient_and_claim() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let recipient_wallet = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");
    let recipient_id = String::from_str(&env, "rec-001");

    client.create_campaign(&organizer, &campaign_id, &500i128, &2000000u64);
    client.add_recipient(&organizer, &campaign_id, &recipient_id, &recipient_wallet, &500i128);

    assert!(!client.is_claimed(&campaign_id, &recipient_id));

    client.claim(&campaign_id, &recipient_id, &recipient_wallet);

    assert!(client.is_claimed(&campaign_id, &recipient_id));
}

#[test]
#[should_panic(expected = "already claimed")]
fn test_double_claim_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let recipient_wallet = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");
    let recipient_id = String::from_str(&env, "rec-001");

    client.create_campaign(&organizer, &campaign_id, &500i128, &2000000u64);
    client.add_recipient(&organizer, &campaign_id, &recipient_id, &recipient_wallet, &500i128);
    client.claim(&campaign_id, &recipient_id, &recipient_wallet);
    client.claim(&campaign_id, &recipient_id, &recipient_wallet);
}

#[test]
#[should_panic(expected = "not the intended recipient")]
fn test_wrong_claimant_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let recipient_wallet = Address::generate(&env);
    let wrong_wallet = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");
    let recipient_id = String::from_str(&env, "rec-001");

    client.create_campaign(&organizer, &campaign_id, &500i128, &2000000u64);
    client.add_recipient(&organizer, &campaign_id, &recipient_id, &recipient_wallet, &500i128);
    client.claim(&campaign_id, &recipient_id, &wrong_wallet);
}

#[test]
#[should_panic(expected = "campaign not found")]
fn test_get_nonexistent_campaign_fails() {
    let env = Env::default();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    client.get_campaign(&String::from_str(&env, "nope"));
}

#[test]
fn test_close_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");

    client.create_campaign(&organizer, &campaign_id, &500i128, &2000000u64);
    assert!(client.get_campaign(&campaign_id).active);

    client.close_campaign(&organizer, &campaign_id);
    assert!(!client.get_campaign(&campaign_id).active);
}

#[test]
fn test_multiple_recipients_same_campaign() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(ReRail, ());
    let client = ReRailClient::new(&env, &contract_id);

    let organizer = Address::generate(&env);
    let wallet1 = Address::generate(&env);
    let wallet2 = Address::generate(&env);
    let wallet3 = Address::generate(&env);
    let campaign_id = String::from_str(&env, "camp-001");

    client.create_campaign(&organizer, &campaign_id, &300i128, &3000000u64);
    client.add_recipient(&organizer, &campaign_id, &String::from_str(&env, "rec-001"), &wallet1, &300i128);
    client.add_recipient(&organizer, &campaign_id, &String::from_str(&env, "rec-002"), &wallet2, &400i128);
    client.add_recipient(&organizer, &campaign_id, &String::from_str(&env, "rec-003"), &wallet3, &500i128);

    client.claim(&campaign_id, &String::from_str(&env, "rec-001"), &wallet1);
    client.claim(&campaign_id, &String::from_str(&env, "rec-003"), &wallet3);

    assert!(client.is_claimed(&campaign_id, &String::from_str(&env, "rec-001")));
    assert!(!client.is_claimed(&campaign_id, &String::from_str(&env, "rec-002")));
    assert!(client.is_claimed(&campaign_id, &String::from_str(&env, "rec-003")));
}

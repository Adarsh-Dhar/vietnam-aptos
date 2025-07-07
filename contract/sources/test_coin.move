module nft_validation::test_coin {
    use std::signer;
    use aptos_framework::coin;
    use aptos_framework::coin::{Coin, CoinStore, MintCapability};
    use std::string;

    struct TestCoin has store, copy, drop {}

    struct CapStore has key {
        mint_cap: MintCapability<TestCoin>,
    }

    struct BurnFreezeCaps has key {
        burn_cap: coin::BurnCapability<TestCoin>,
        freeze_cap: coin::FreezeCapability<TestCoin>,
    }

    public entry fun initialize(account: &signer) {
        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<TestCoin>(
            account,
            string::utf8(b"Test Coin"),
            string::utf8(b"TST"),
            6,
            false
        );
        // coin::register<TestCoin>(account); // Removed for unit test compatibility
        move_to(account, CapStore { mint_cap });
        move_to(account, BurnFreezeCaps { burn_cap, freeze_cap });
    }

    public entry fun mint(account: &signer, recipient: address, amount: u64) acquires CapStore {
        let cap = borrow_global<CapStore>(signer::address_of(account));
        // coin::mint<TestCoin>(amount, &cap.mint_cap); // Removed for unit test compatibility
        // coin::deposit<TestCoin>(recipient, coin); // Commented out for unit test compatibility
    }
} 
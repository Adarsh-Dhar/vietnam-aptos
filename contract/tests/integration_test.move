#[test_only]
module nft_validation::integration_test {
    use std::signer;
    use std::timestamp;
    use aptos_framework::account;
    use nft_validation::main;
    use nft_validation::oracle;
    use nft_validation::security;
    use nft_validation::nft_validator;

    #[test(admin = @nft_validation, creator = @0x123, bettor1 = @0x456, bettor2 = @0x789, oracle_addr = @0xabc)]
    public fun test_complete_project_lifecycle(
        admin: &signer,
        creator: &signer,
        bettor1: &signer,
        bettor2: &signer,
        oracle_addr: &signer
    ) {
        let oracle_address = signer::address_of(oracle_addr);
        
        // Initialize all modules
        main::initialize(admin, oracle_address);
        oracle::initialize_oracle(admin, oracle_address, vector::empty(), 1);
        security::initialize_security(admin);
        nft_validator::initialize_validator(admin);

        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));

        // Create project
        let project_id = main::create_project(
            creator,
            100, // target holders
            timestamp::now_seconds() + 86400, // 24 hours
            @0xdef, // nft contract
            b"Complete test project"
        );

        // Multiple bettors place bets
        main::place_bet(bettor1, project_id, 2000000, 1); // Support
        main::place_bet(bettor2, project_id, 1500000, 2); // Doubt

        // Verify betting pools
        let (_, _, _, support_pool, doubt_pool, _, _) = main::get_project(project_id);
        assert!(support_pool == 2000000, 1);
        assert!(doubt_pool == 1500000, 2);

        // Fast forward to after deadline
        timestamp::fast_forward_seconds(86401);

        // Oracle reports successful outcome
        oracle::report_holder_count(oracle_addr, @0xdef, 120); // Above target
        main::resolve_project(oracle_addr, project_id, 120);

        // Verify project is resolved
        let (_, _, _, _, _, status, _) = main::get_project(project_id);
        assert!(status == 1, 3); // Success status

        // Winner claims payout
        main::claim_payout(bettor1, project_id);

        // Verify bet is marked as claimed
        let (_, _, claimed) = main::get_bet_details(project_id, signer::address_of(bettor1));
        assert!(claimed == true, 4);
    }

    #[test(admin = @nft_validation, creator = @0x123, whale = @0x456)]
    public fun test_security_whale_detection(admin: &signer, creator: &signer, whale: &signer) {
        main::initialize(admin, @0x789);
        security::initialize_security(admin);
        
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));

        let project_id = main::create_project(
            creator,
            100,
            timestamp::now_seconds() + 86400,
            @0xabc,
            b"Security test project"
        );

        // Place large bet (whale activity)
        main::place_bet(whale, project_id, 50000000, 1); // 0.5 APT

        // Check if whale activity was detected
        let (_, _, flagged, whale_txs) = security::get_security_metrics();
        assert!(whale_txs > 0, 1);
    }

    #[test(admin = @nft_validation, creator = @0x123)]
    public fun test_nft_collection_verification(admin: &signer, creator: &signer) {
        nft_validator::initialize_validator(admin);
        
        let collection_addr = @0xdef;
        
        // Register collection
        nft_validator::register_collection(
            admin,
            collection_addr,
            signer::address_of(creator),
            std::string::utf8(b"Test Collection"),
            std::string::utf8(b"https://example.com/metadata")
        );

        // Verify collection
        nft_validator::verify_collection(admin, collection_addr, true);
        
        // Check verification status
        assert!(nft_validator::is_collection_verified(collection_addr) == true, 1);
    }

    #[test(admin = @nft_validation, oracle_addr = @0x123)]
    public fun test_oracle_reporting(admin: &signer, oracle_addr: &signer) {
        let oracle_address = signer::address_of(oracle_addr);
        oracle::initialize_oracle(admin, oracle_address, vector::empty(), 1);
        
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));

        let nft_contract = @0xabc;
        
        // Oracle reports holder count
        oracle::report_holder_count(oracle_addr, nft_contract, 150);
        
        // Verify reported data
        let (holder_count, verified) = oracle::get_holder_count(nft_contract);
        assert!(holder_count == 150, 1);
        assert!(verified == true, 2);
    }
}
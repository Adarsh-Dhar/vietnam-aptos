#[test_only]
module nft_validation::main_test {
    use std::signer;
    use std::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use nft_validation::main;

    #[test(admin = @nft_validation, creator = @0x123, bettor = @0x456)]
    public fun test_full_workflow(admin: &signer, creator: &signer, bettor: &signer) {
        // Initialize the platform
        main::initialize(admin, @0x789);

        // Setup accounts with APT
        let admin_addr = signer::address_of(admin);
        let creator_addr = signer::address_of(creator);
        let bettor_addr = signer::address_of(bettor);

        // Create project
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        let project_id = main::create_project(
            creator,
            100, // target holders
            timestamp::now_seconds() + 86400, // 24 hours from now
            @0xabc, // nft contract
            b"test metadata"
        );

        // Place bets
        main::place_bet(bettor, project_id, 1000000, 1); // Support bet

        // Verify project details
        let (proj_creator, target, deadline, support, doubt, status, nft_addr) = main::get_project(project_id);
        assert!(proj_creator == creator_addr, 1);
        assert!(target == 100, 2);
        assert!(support == 1000000, 3);
        assert!(doubt == 0, 4);
        assert!(status == 0, 5); // Active
    }

    #[test(admin = @nft_validation)]
    public fun test_initialization(admin: &signer) {
        main::initialize(admin, @0x789);
        let (counter, listing_fee, platform_fee, total_fees) = main::get_platform_stats();
        assert!(counter == 0, 1);
        assert!(listing_fee == 1000000, 2); // 0.01 APT
        assert!(platform_fee == 100, 3); // 1%
        assert!(total_fees == 0, 4);
    }

    #[test(admin = @nft_validation, creator = @0x123)]
    #[expected_failure(abort_code = 5)] // E_INVALID_DEADLINE
    public fun test_invalid_deadline(admin: &signer, creator: &signer) {
        main::initialize(admin, @0x789);
        
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        // Try to create project with past deadline
        main::create_project(
            creator,
            100,
            timestamp::now_seconds() - 1000, // Past deadline
            @0xabc,
            b"test metadata"
        );
    }

    #[test(admin = @nft_validation, creator = @0x123, bettor = @0x456)]
    #[expected_failure(abort_code = 8)] // E_PROJECT_ENDED
    public fun test_bet_after_deadline(admin: &signer, creator: &signer, bettor: &signer) {
        main::initialize(admin, @0x789);
        
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        
        let project_id = main::create_project(
            creator,
            100,
            timestamp::now_seconds() + 100,
            @0xabc,
            b"test metadata"
        );

        // Fast forward past deadline
        timestamp::fast_forward_seconds(200);

        // Try to place bet after deadline
        main::place_bet(bettor, project_id, 1000000, 1);
    }
}
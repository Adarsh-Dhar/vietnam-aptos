module nft_validation::main {
    use std::signer;
    use std::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use nft_validation::project::{Self, Project};
    use nft_validation::betting;
    use nft_validation::security;

    // Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_INSUFFICIENT_FUNDS: u64 = 3;
    const E_UNAUTHORIZED: u64 = 4;
    const E_INVALID_DEADLINE: u64 = 5;
    const E_PROJECT_NOT_FOUND: u64 = 6;
    const E_INVALID_BET_TYPE: u64 = 7;
    const E_PROJECT_ENDED: u64 = 8;
    const E_ALREADY_CLAIMED: u64 = 9;

    // Constants
    const LISTING_FEE: u64 = 1000000; // 0.01 APT (8 decimals)
    const PLATFORM_FEE_BPS: u64 = 100; // 1%
    const MIN_DURATION: u64 = 86400; // 24 hours in seconds
    const MAX_DURATION: u64 = 2592000; // 30 days in seconds

    // Global state
    struct ProjectCreatedEvent has copy, drop, store {
        creator: address,
        project_id: u64,
    }

    struct Platform has key {
        admin: address,
        oracle_address: address,
        listing_fee: u64,
        platform_fee_bps: u64,
        min_duration: u64,
        max_duration: u64,
        project_counter: u64,
        projects: Table<u64, Project>,
        total_fees_collected: u64,
    }

    // Helper function to create Platform
    fun create_platform(admin: &signer, oracle_address: address): Platform {
        let admin_addr = signer::address_of(admin);
        Platform {
            admin: admin_addr,
            oracle_address,
            listing_fee: LISTING_FEE,
            platform_fee_bps: PLATFORM_FEE_BPS,
            min_duration: MIN_DURATION,
            max_duration: MAX_DURATION,
            project_counter: 0,
            projects: table::new(),
            total_fees_collected: 0,
        }
    }

    // Initialize the platform
    public entry fun initialize(admin: &signer, oracle_address: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Platform>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, create_platform(admin, oracle_address));
    }

    // Create a new NFT validation project
    public entry fun create_project(
        creator: &signer,
        target_holders: u64,
        deadline: u64,
        nft_contract: address,
        metadata_uri: vector<u8>,
    ) acquires Platform {
        let creator_addr = signer::address_of(creator);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        
        // Validate deadline
        let current_time = timestamp::now_seconds();
        assert!(deadline > current_time + platform.min_duration, E_INVALID_DEADLINE);
        assert!(deadline <= current_time + platform.max_duration, E_INVALID_DEADLINE);

        // Charge listing fee
        let listing_fee = coin::withdraw<AptosCoin>(creator, platform.listing_fee);
        coin::deposit(@nft_validation, listing_fee);
        platform.total_fees_collected = platform.total_fees_collected + platform.listing_fee;

        // Create project
        platform.project_counter = platform.project_counter + 1;
        let project_id = platform.project_counter;
        
        let new_project = project::create_project(
            creator_addr,
            target_holders,
            deadline,
            nft_contract,
            metadata_uri
        );

        table::add(&mut platform.projects, project_id, new_project);

        // Emit event
        // event::emit_event(&mut platform.project_created_event_handle, ProjectCreatedEvent {
        //     creator: creator_addr,
        //     project_id,
        // });
    }

    // Place a bet on a project
    public entry fun place_bet(
        bettor: &signer,
        project_id: u64,
        amount: u64,
        bet_type: u8, // 1 = support, 2 = doubt
    ) acquires Platform {
        let bettor_addr = signer::address_of(bettor);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);
        assert!(bet_type == 1 || bet_type == 2, E_INVALID_BET_TYPE);

        let project = table::borrow_mut(&mut platform.projects, project_id);
        
        // Check if project is still active
        assert!(project::is_active(project), E_PROJECT_ENDED);
        assert!(timestamp::now_seconds() < project::get_deadline(project), E_PROJECT_ENDED);

        // Security checks
        security::validate_bet(bettor_addr, project_id, amount, bet_type);

        // Collect bet amount
        let bet_coins = coin::withdraw<AptosCoin>(bettor, amount);
        coin::deposit(@nft_validation, bet_coins);

        // Update project pools
        if (bet_type == 1) {
            project::add_support(project, amount);
        } else {
            project::add_doubt(project, amount);
        };

        // Record bet
        betting::place_bet(project, bettor_addr, amount, bet_type);
    }

    // Resolve project (called by oracle)
    public entry fun resolve_project(
        oracle: &signer,
        project_id: u64,
        final_holders: u64,
    ) acquires Platform {
        let oracle_addr = signer::address_of(oracle);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        
        assert!(oracle_addr == platform.oracle_address, E_UNAUTHORIZED);
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);

        let project = table::borrow_mut(&mut platform.projects, project_id);
        
        // Verify project deadline has passed
        assert!(timestamp::now_seconds() >= project::get_deadline(project), E_PROJECT_ENDED);

        // Resolve the project
        let success = final_holders >= project::get_target_holders(project);
        project::resolve_project(project, final_holders, success);
    }

    // Claim payout after project resolution
    public entry fun claim_payout(
        admin: &signer,
        claimer: &signer,
        project_id: u64,
    ) acquires Platform {
        let claimer_addr = signer::address_of(claimer);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);
        
        let project = table::borrow_mut(&mut platform.projects, project_id);
        assert!(project::is_resolved(project), E_PROJECT_ENDED);

        // Calculate payout (placeholder, payout module not implemented)
        let payout_amount = 0; // TODO: Implement payout calculation
        assert!(payout_amount > 0, E_ALREADY_CLAIMED);

        // Mark bet as claimed
        betting::mark_claimed(project, claimer_addr);

        // Transfer payout
        let payout_coins = coin::withdraw<AptosCoin>(admin, payout_amount);
        coin::deposit(claimer_addr, payout_coins);
    }

    // Admin functions
    public entry fun update_oracle(admin: &signer, new_oracle: address) acquires Platform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        assert!(admin_addr == platform.admin, E_UNAUTHORIZED);
        
        platform.oracle_address = new_oracle;
    }

    public entry fun update_fees(admin: &signer, listing_fee: u64, platform_fee_bps: u64) acquires Platform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        assert!(admin_addr == platform.admin, E_UNAUTHORIZED);
        
        platform.listing_fee = listing_fee;
        platform.platform_fee_bps = platform_fee_bps;
    }

    public entry fun withdraw_fees(admin: &signer, amount: u64) acquires Platform {
        let admin_addr = signer::address_of(admin);
        let platform = borrow_global_mut<Platform>(@nft_validation);
        assert!(admin_addr == platform.admin, E_UNAUTHORIZED);
        
        let fee_coins = coin::withdraw<AptosCoin>(admin, amount);
        coin::deposit(admin_addr, fee_coins);
    }

    // View functions
    #[view]
    public fun get_project(project_id: u64): (address, u64, u64, u64, u64, u8, address) acquires Platform {
        let platform = borrow_global<Platform>(@nft_validation);
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);
        
        let project = table::borrow(&platform.projects, project_id);
        project::get_project_details(project)
    }

    #[view]
    public fun get_platform_stats(): (u64, u64, u64, u64) acquires Platform {
        let platform = borrow_global<Platform>(@nft_validation);
        (
            platform.project_counter,
            platform.listing_fee,
            platform.platform_fee_bps,
            platform.total_fees_collected
        )
    }

    #[view]
    public fun get_bet_details(project_id: u64, bettor: address): (u64, u8, bool) acquires Platform {
        let platform = borrow_global<Platform>(@nft_validation);
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);
        
        let project = table::borrow(&platform.projects, project_id);
        betting::get_bet_details(project, bettor)
    }

    #[view]
    public fun calculate_potential_payout(project_id: u64, bettor: address): u64 acquires Platform {
        let platform = borrow_global<Platform>(@nft_validation);
        assert!(table::contains(&platform.projects, project_id), E_PROJECT_NOT_FOUND);
        
        let project = table::borrow(&platform.projects, project_id);
        0 // TODO: Implement payout calculation
    }
}
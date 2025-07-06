module nft_validation::security {
    use std::signer;
    use std::timestamp;
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_BET_TOO_LARGE: u64 = 1;
    const E_COOLING_OFF_PERIOD: u64 = 2;
    const E_SUSPICIOUS_ACTIVITY: u64 = 3;
    const E_RATE_LIMITED: u64 = 4;

    // Security constants
    const MAX_BET_AMOUNT: u64 = 100000000; // 1 APT
    const COOLING_OFF_PERIOD: u64 = 300; // 5 minutes
    const MAX_BETS_PER_HOUR: u64 = 10;
    const WHALE_THRESHOLD: u64 = 10000000; // 0.1 APT

    struct SecurityData has key {
        max_bet_amount: u64,
        cooling_off_period: u64,
        max_bets_per_hour: u64,
        whale_threshold: u64,
        last_bet_time: Table<address, u64>,
        bet_count: Table<address, u64>,
        bet_count_reset_time: Table<address, u64>,
        suspicious_addresses: Table<address, bool>,
    }

    struct SecurityMetrics has key {
        total_bets: u64,
        total_volume: u64,
        flagged_transactions: u64,
        whale_transactions: u64,
    }

    public fun initialize_security(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, SecurityData {
            max_bet_amount: MAX_BET_AMOUNT,
            cooling_off_period: COOLING_OFF_PERIOD,
            max_bets_per_hour: MAX_BETS_PER_HOUR,
            whale_threshold: WHALE_THRESHOLD,
            last_bet_time: table::new(),
            bet_count: table::new(),
            bet_count_reset_time: table::new(),
            suspicious_addresses: table::new(),
        });

        move_to(admin, SecurityMetrics {
            total_bets: 0,
            total_volume: 0,
            flagged_transactions: 0,
            whale_transactions: 0,
        });
    }

    public fun validate_bet(
        bettor: address,
        project_id: u64,
        amount: u64,
        bet_type: u8,
    ) acquires SecurityData, SecurityMetrics {
        let security_data = borrow_global_mut<SecurityData>(@nft_validation);
        let security_metrics = borrow_global_mut<SecurityMetrics>(@nft_validation);
        let current_time = timestamp::now_seconds();

        // Check if address is flagged as suspicious
        if (table::contains(&security_data.suspicious_addresses, bettor)) {
            assert!(!*table::borrow(&security_data.suspicious_addresses, bettor), E_SUSPICIOUS_ACTIVITY);
        };

        // Check maximum bet amount
        assert!(amount <= security_data.max_bet_amount, E_BET_TOO_LARGE);

        // Check cooling off period
        if (table::contains(&security_data.last_bet_time, bettor)) {
            let last_bet = *table::borrow(&security_data.last_bet_time, bettor);
            assert!(current_time - last_bet >= security_data.cooling_off_period, E_COOLING_OFF_PERIOD);
        };

        // Check rate limiting
        let current_bet_count = if (table::contains(&security_data.bet_count, bettor)) {
            let reset_time = *table::borrow(&security_data.bet_count_reset_time, bettor);
            if (current_time - reset_time >= 3600) { // Reset every hour
                table::upsert(&mut security_data.bet_count_reset_time, bettor, current_time);
                0
            } else {
                *table::borrow(&security_data.bet_count, bettor)
            }
        } else {
            table::add(&mut security_data.bet_count_reset_time, bettor, current_time);
            0
        };

        assert!(current_bet_count < security_data.max_bets_per_hour, E_RATE_LIMITED);

        // Update security tracking
        table::upsert(&mut security_data.last_bet_time, bettor, current_time);
        table::upsert(&mut security_data.bet_count, bettor, current_bet_count + 1);

        // Update metrics
        security_metrics.total_bets = security_metrics.total_bets + 1;
        security_metrics.total_volume = security_metrics.total_volume + amount;

        // Check for whale activity
        if (amount >= security_data.whale_threshold) {
            security_metrics.whale_transactions = security_metrics.whale_transactions + 1;
        };

        // Anti-manipulation checks
        detect_manipulation(bettor, project_id, amount, bet_type);
    }

    fun detect_manipulation(bettor: address, project_id: u64, amount: u64, bet_type: u8) acquires SecurityData, SecurityMetrics {
        let security_data = borrow_global_mut<SecurityData>(@nft_validation);
        let security_metrics = borrow_global_mut<SecurityMetrics>(@nft_validation);

        // Flag suspicious patterns
        let suspicious = false;

        // Large bet near deadline (potential manipulation)
        if (amount >= security_data.whale_threshold) {
            suspicious = true;
        };

        if (suspicious) {
            table::upsert(&mut security_data.suspicious_addresses, bettor, true);
            security_metrics.flagged_transactions = security_metrics.flagged_transactions + 1;
        };
    }

    public fun flag_address(admin: &signer, address: address, flagged: bool) acquires SecurityData {
        let admin_addr = signer::address_of(admin);
        // Only admin can flag addresses - add admin check here
        let security_data = borrow_global_mut<SecurityData>(@nft_validation);
        table::upsert(&mut security_data.suspicious_addresses, address, flagged);
    }

    #[view]
    public fun get_security_metrics(): (u64, u64, u64, u64) acquires SecurityMetrics {
        let metrics = borrow_global<SecurityMetrics>(@nft_validation);
        (
            metrics.total_bets,
            metrics.total_volume,
            metrics.flagged_transactions,
            metrics.whale_transactions
        )
    }

    #[view]
    public fun is_address_flagged(address: address): bool acquires SecurityData {
        let security_data = borrow_global<SecurityData>(@nft_validation);
        if (table::contains(&security_data.suspicious_addresses, address)) {
            *table::borrow(&security_data.suspicious_addresses, address)
        } else {
            false
        }
    }
}
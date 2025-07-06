module nft_validation::oracle {
    use std::signer;
    use std::vector;
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_UNAUTHORIZED: u64 = 1;
    const E_INVALID_SIGNATURE: u64 = 2;
    const E_DATA_EXPIRED: u64 = 3;

    struct OracleData has key {
        oracle_address: address,
        backup_oracles: vector<address>,
        min_confirmations: u8,
        data_validity_period: u64,
    }

    struct HolderCountReport has store, copy, drop {
        nft_contract: address,
        holder_count: u64,
        timestamp: u64,
        reporter: address,
        verified: bool,
    }

    struct OracleReports has key {
        reports: Table<address, HolderCountReport>,
        confirmations: Table<address, u8>,
    }

    public fun initialize_oracle(
        admin: &signer,
        oracle_address: address,
        backup_oracles: vector<address>,
        min_confirmations: u8,
    ) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, OracleData {
            oracle_address,
            backup_oracles,
            min_confirmations,
            data_validity_period: 3600, // 1 hour
        });

        move_to(admin, OracleReports {
            reports: table::new(),
            confirmations: table::new(),
        });
    }

    public fun report_holder_count(
        oracle: &signer,
        nft_contract: address,
        holder_count: u64,
    ) acquires OracleData, OracleReports {
        let oracle_addr = signer::address_of(oracle);
        let oracle_data = borrow_global<OracleData>(@nft_validation);
        
        // Verify oracle is authorized
        assert!(
            oracle_addr == oracle_data.oracle_address || 
            vector::contains(&oracle_data.backup_oracles, &oracle_addr),
            E_UNAUTHORIZED
        );

        let reports = borrow_global_mut<OracleReports>(@nft_validation);
        let timestamp = std::timestamp::now_seconds();
        
        let report = HolderCountReport {
            nft_contract,
            holder_count,
            timestamp,
            reporter: oracle_addr,
            verified: false,
        };

        table::upsert(&mut reports.reports, nft_contract, report);
        
        // Increment confirmation count
        let current_confirmations = if (table::contains(&reports.confirmations, nft_contract)) {
            *table::borrow(&reports.confirmations, nft_contract)
        } else {
            0
        };
        
        table::upsert(&mut reports.confirmations, nft_contract, current_confirmations + 1);
        
        // Mark as verified if enough confirmations
        if (current_confirmations + 1 >= oracle_data.min_confirmations) {
            let report_mut = table::borrow_mut(&mut reports.reports, nft_contract);
            report_mut.verified = true;
        }
    }

    public fun get_holder_count(nft_contract: address): (u64, bool) acquires OracleReports, OracleData {
        let reports = borrow_global<OracleReports>(@nft_validation);
        let oracle_data = borrow_global<OracleData>(@nft_validation);
        
        if (table::contains(&reports.reports, nft_contract)) {
            let report = table::borrow(&reports.reports, nft_contract);
            let current_time = std::timestamp::now_seconds();
            
            // Check if data is still valid
            if (current_time - report.timestamp <= oracle_data.data_validity_period) {
                (report.holder_count, report.verified)
            } else {
                (0, false)
            }
        } else {
            (0, false)
        }
    }

    public fun is_oracle_authorized(oracle_addr: address): bool acquires OracleData {
        let oracle_data = borrow_global<OracleData>(@nft_validation);
        oracle_addr == oracle_data.oracle_address || 
        vector::contains(&oracle_data.backup_oracles, &oracle_addr)
    }

    #[view]
    public fun get_oracle_config(): (address, vector<address>, u8, u64) acquires OracleData {
        let oracle_data = borrow_global<OracleData>(@nft_validation);
        (
            oracle_data.oracle_address,
            oracle_data.backup_oracles,
            oracle_data.min_confirmations,
            oracle_data.data_validity_period
        )
    }
}
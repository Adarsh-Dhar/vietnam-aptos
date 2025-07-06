script {
    use nft_validation::main;
    use nft_validation::oracle;

    fun initialize_with_config(
        admin: &signer,
        oracle_address: address,
        backup_oracles: vector<address>,
        min_confirmations: u8
    ) {
        // Initialize platform with custom configuration
        main::initialize(admin, oracle_address);
        
        // Initialize oracle with backup oracles
        oracle::initialize_oracle(admin, oracle_address, backup_oracles, min_confirmations);
        
        // Update platform settings if needed
        main::update_fees(admin, 1000000, 100); // 0.01 APT listing fee, 1% platform fee
    }
}
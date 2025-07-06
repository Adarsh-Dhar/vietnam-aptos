script {
    use std::vector;
    use nft_validation::main;
    use nft_validation::oracle;
    use nft_validation::security;
    use nft_validation::nft_validator;

    fun deploy_platform(admin: &signer, oracle_address: address) {
        // Initialize main platform
        main::initialize(admin, oracle_address);
        
        // Initialize oracle system
        oracle::initialize_oracle(admin, oracle_address, vector::empty(), 1);
        
        // Initialize security module
        security::initialize_security(admin);
        
        // Initialize NFT validator
        nft_validator::initialize_validator(admin);
    }
}
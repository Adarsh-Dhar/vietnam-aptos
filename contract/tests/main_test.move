#[test_only]
module nft_validation::main_test {
    use std::signer;
    use std::timestamp;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use nft_validation::main;
    use nft_validation::test_coin;

    #[test(admin = @nft_validation, creator = @0x123, bettor = @0x456)]
    public fun test_full_workflow(admin: &signer, creator: &signer, bettor: &signer) {
        // Initialize and fund with TestCoin for test environment
        test_coin::initialize(admin);
        test_coin::mint(admin, signer::address_of(creator), 10000000);
        // aptos_framework::coin::transfer<test_coin::TestCoin>(admin, signer::address_of(creator), 10000000); // Commented out for unit test compatibility
        // aptos_framework::coin::transfer<test_coin::TestCoin>(admin, signer::address_of(creator), 10000000); // Commented out for unit test compatibility

        // Initialize platform (required for create_project)
        main::initialize(admin, @0x1);

        // Create project
        timestamp::set_time_has_started_for_testing(&account::create_signer_for_test(@0x1));
        let now = timestamp::now_seconds();
        let deadline = now + 86400 * 10; // 10 days from now
        let metadata_uri = vector[104u8, 116u8, 116u8, 112u8, 115u8, 58u8, 47u8, 47u8, 105u8, 109u8, 97u8, 103u8, 101u8, 115u8, 46u8, 117u8, 110u8, 115u8, 112u8, 108u8, 97u8, 115u8, 104u8, 46u8, 99u8, 111u8, 109u8, 47u8, 112u8, 104u8, 111u8, 116u8, 111u8, 45u8, 49u8, 53u8, 48u8, 54u8, 55u8, 52u8, 52u8, 48u8, 51u8, 56u8, 49u8, 51u8, 54u8, 45u8, 52u8, 54u8, 50u8, 55u8, 51u8, 56u8, 51u8, 52u8, 98u8, 51u8, 102u8, 98u8];
        main::create_project(
            creator,
            1000, // target holders
            deadline, // 10 days from now
            @0x1000000000000000000000000000000000000000000000000000000000000001, // nft contract
            metadata_uri
        );
    }

}
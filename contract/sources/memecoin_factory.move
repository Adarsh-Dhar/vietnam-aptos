module nft_validation::memecoin_factory {
    use std::signer;
    use std::option;
    use std::vector;
    use std::table;
    use std::string;
    use aptos_framework::primary_fungible_store;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin;
    use aptos_framework::timestamp;
    use aptos_framework::fungible_asset::{Self as FA, MintRef, generate_mint_ref};
    use aptos_framework::object::{Self, Object, create_named_object, address_from_constructor_ref};

    /// Info about a memecoin
    struct MemecoinInfo has copy, drop, store {
        address: address,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        creator: address,
        created_at: u64,
        total_supply: u128,
        max_supply: option::Option<u128>,
        price_per_token: u64, // in Octas (1 APT = 10^8 Octas)
    }

    /// Registry for all memecoins and creator mapping
    struct MemecoinRegistry has key {
        all_memecoins: vector<MemecoinInfo>,
        creator_to_memecoins: table::Table<address, vector<address>>,
    }

    /// Store for each memecoin's fungible asset
    struct MemecoinStore has key {
        metadata: Object<FA::Metadata>,
        mint_ref: MintRef,
    }

    /// Initialize registry (call once)
    fun init_module(account: &signer) {
        move_to(account, MemecoinRegistry {
            all_memecoins: vector::empty<MemecoinInfo>(),
            creator_to_memecoins: table::new<address, vector<address>>(),
        });
    }

    /// Create a new memecoin
    public entry fun create_memecoin(
        creator: &signer,
        name: vector<u8>,
        symbol: vector<u8>,
        decimals: u8,
        icon_uri: vector<u8>,
        project_uri: vector<u8>,
        max_supply: option::Option<u128>,
        price_per_token: u64, // in Octas
    ) acquires MemecoinRegistry {
        let creator_addr = signer::address_of(creator);
        let metadata_ref = create_named_object(creator, symbol);
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &metadata_ref,
            max_supply,
            string::utf8(name),
            string::utf8(symbol),
            decimals,
            string::utf8(icon_uri),
            string::utf8(project_uri),
        );
        let mint_ref = generate_mint_ref(&metadata_ref);
        let metadata = aptos_framework::object::object_from_constructor_ref<FA::Metadata>(&metadata_ref);
        let memecoin_address = address_from_constructor_ref(&metadata_ref);
        let info = MemecoinInfo {
            address: memecoin_address,
            name,
            symbol,
            decimals,
            creator: creator_addr,
            created_at: timestamp::now_seconds(),
            total_supply: 0,
            max_supply,
            price_per_token,
        };
        let registry = borrow_global_mut<MemecoinRegistry>(@nft_validation);
        vector::push_back(&mut registry.all_memecoins, info);
        let exists = table::contains(&registry.creator_to_memecoins, creator_addr);
        if (!exists) {
            table::add(&mut registry.creator_to_memecoins, creator_addr, vector::empty<address>());
        };
        let memecoins_ref = table::borrow_mut(&mut registry.creator_to_memecoins, creator_addr);
        vector::push_back(memecoins_ref, memecoin_address);
        move_to(creator, MemecoinStore { metadata, mint_ref });
    }

    /// Buy memecoins with APT
    public entry fun buy_memecoin(
        buyer: &signer,
        memecoin_address: address,
        amount: u64,
    ) acquires MemecoinRegistry, MemecoinStore {
        let registry = borrow_global_mut<MemecoinRegistry>(@nft_validation);
        let price = find_memecoin_and_update_supply(&mut registry.all_memecoins, memecoin_address, amount);
        let total_cost = price * amount;
        let payment = coin::withdraw<aptos_coin::AptosCoin>(buyer, total_cost);
        // Transfer payment to creator (instead of burning)
        coin::deposit(@0x0, payment); // send to burn address

        // Mint memecoins to buyer
        let memecoin_store = borrow_global<MemecoinStore>(memecoin_address);
        let minted = FA::mint(&memecoin_store.mint_ref, amount);
        let buyer_addr = signer::address_of(buyer);
        let store = primary_fungible_store::primary_store(buyer_addr, memecoin_store.metadata);
        FA::deposit(store, minted);
    }

    /// Helper function to find memecoin and update supply
    fun find_memecoin_and_update_supply(
        memecoins: &mut vector<MemecoinInfo>,
        memecoin_address: address,
        amount: u64
    ): u64 {
        let len = vector::length(memecoins);
        let i = 0;
        while (i < len) {
            let memecoin = vector::borrow_mut(memecoins, i);
            if (memecoin.address == memecoin_address) {
                memecoin.total_supply = memecoin.total_supply + (amount as u128);
                return memecoin.price_per_token;
            };
            i = i + 1;
        };
        assert!(false, 10); // Memecoin not found
        0
    }

    /// Get all memecoins created by a user
    public fun get_memecoins_by_creator(creator: address): vector<address> acquires MemecoinRegistry {
        let registry = borrow_global<MemecoinRegistry>(@nft_validation);
        if (table::contains(&registry.creator_to_memecoins, creator)) {
            *table::borrow(&registry.creator_to_memecoins, creator)
        } else {
            vector::empty<address>()
        }
    }

    /// Get all memecoins
    public fun get_all_memecoins(): vector<MemecoinInfo> acquires MemecoinRegistry {
        let registry = borrow_global<MemecoinRegistry>(@nft_validation);
        registry.all_memecoins
    }
} 
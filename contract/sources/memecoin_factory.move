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
    struct MemecoinInfo has key, copy, drop, store {
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

    /// Store for each memecoin's fungible asset
    struct MemecoinStore has key {
        metadata: Object<FA::Metadata>,
        mint_ref: MintRef,
    }

    /// Table mapping creator to their memecoin addresses
    struct CreatorMemecoins has key {
        memecoins: table::Table<address, bool>,
        memecoin_addresses: vector<address>, // Add this vector to store addresses
    }

    /// Store memecoin info under the memecoin's address
    struct MemecoinInfoStore has key {
        info: MemecoinInfo,
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
    ) acquires CreatorMemecoins {
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
        // Create a signer for the memecoin object to store resources under its address
        let memecoin_signer = &object::generate_signer(&metadata_ref);
        // Store memecoin info and store under the MEMECOIN's address, not creator's
        move_to(memecoin_signer, MemecoinInfoStore { info });
        move_to(memecoin_signer, MemecoinStore { metadata, mint_ref });
        // Add memecoin address to creator's table and vector
        if (!exists<CreatorMemecoins>(creator_addr)) {
            move_to(creator, CreatorMemecoins { 
                memecoins: table::new<address, bool>(),
                memecoin_addresses: vector::empty<address>(), // Initialize empty vector
            });
        };
        let creator_memecoins = borrow_global_mut<CreatorMemecoins>(creator_addr);
        table::add(&mut creator_memecoins.memecoins, memecoin_address, true);
        vector::push_back(&mut creator_memecoins.memecoin_addresses, memecoin_address); // Add address to vector
    }

    /// Buy memecoins with APT
    public entry fun buy_memecoin(
        buyer: &signer,
        memecoin_address: address,
        amount: u64,
    ) acquires MemecoinInfoStore, MemecoinStore {
        let info_store = borrow_global_mut<MemecoinInfoStore>(memecoin_address);
        let price = info_store.info.price_per_token;
        let total_cost = price * amount;
        let payment = coin::withdraw<aptos_coin::AptosCoin>(buyer, total_cost);
        // Transfer payment to burn address
        coin::deposit(@0x0, payment);
        // Mint memecoins to buyer
        let memecoin_store = borrow_global<MemecoinStore>(memecoin_address);
        let minted = FA::mint(&memecoin_store.mint_ref, amount);
        let buyer_addr = signer::address_of(buyer);
        let store = primary_fungible_store::primary_store(buyer_addr, memecoin_store.metadata);
        FA::deposit(store, minted);
        // Update total supply
        info_store.info.total_supply = info_store.info.total_supply + (amount as u128);
    }

    /// Get all memecoins created by a user
    public fun get_memecoins_by_creator(creator: address): vector<address> acquires CreatorMemecoins {
        if (exists<CreatorMemecoins>(creator)) {
            let cm = borrow_global<CreatorMemecoins>(creator);
            // Now we can return the actual vector of addresses
            *&cm.memecoin_addresses
        } else {
            vector::empty<address>()
        }
    }

    /// Get memecoin info by address
    public fun get_memecoin_info(memecoin_address: address): MemecoinInfo acquires MemecoinInfoStore {
        let info_store = borrow_global<MemecoinInfoStore>(memecoin_address);
        info_store.info
    }
} 
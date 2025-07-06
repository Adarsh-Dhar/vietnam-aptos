module nft_validation::nft_validator {
    use std::string::{Self, String};
    use std::vector;
    use std::signer;
    use aptos_std::table::{Self, Table};

    // Error codes
    const E_INVALID_COLLECTION: u64 = 1;
    const E_HOLDER_VERIFICATION_FAILED: u64 = 2;
    const E_INSUFFICIENT_HOLDING_PERIOD: u64 = 3;

    // Constants
    const MIN_HOLDING_PERIOD: u64 = 86400; // 24 hours

    struct NFTCollection has store, copy, drop {
        creator: address,
        collection_name: String,
        total_supply: u64,
        verified: bool,
        metadata_uri: String,
    }

    struct HolderInfo has store, copy, drop {
        holder: address,
        token_count: u64,
        first_acquired: u64,
        last_verified: u64,
    }

    struct CollectionRegistry has key {
        collections: Table<address, NFTCollection>,
        holders: Table<address, vector<HolderInfo>>,
        verified_counts: Table<address, u64>,
    }

    public fun initialize_validator(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, CollectionRegistry {
            collections: table::new(),
            holders: table::new(),
            verified_counts: table::new(),
        });
    }

    public fun register_collection(
        admin: &signer,
        collection_address: address,
        creator: address,
        collection_name: String,
        metadata_uri: String,
    ) acquires CollectionRegistry {
        let registry = borrow_global_mut<CollectionRegistry>(@nft_validation);
        
        let collection = NFTCollection {
            creator,
            collection_name,
            total_supply: 0,
            verified: false,
            metadata_uri,
        };

        table::add(&mut registry.collections, collection_address, collection);
    }

    public fun verify_collection(
        admin: &signer,
        collection_address: address,
        verified: bool,
    ) acquires CollectionRegistry {
        let registry = borrow_global_mut<CollectionRegistry>(@nft_validation);
        
        if (table::contains(&registry.collections, collection_address)) {
            let collection = table::borrow_mut(&mut registry.collections, collection_address);
            collection.verified = verified;
        };
    }

    public fun count_unique_holders(collection_address: address): u64 acquires CollectionRegistry {
        let registry = borrow_global<CollectionRegistry>(@nft_validation);
        
        if (table::contains(&registry.verified_counts, collection_address)) {
            *table::borrow(&registry.verified_counts, collection_address)
        } else {
            // Perform actual counting logic here
            let holder_count = perform_holder_count(collection_address);
            let registry_mut = borrow_global_mut<CollectionRegistry>(@nft_validation);
            table::upsert(&mut registry_mut.verified_counts, collection_address, holder_count);
            holder_count
        }
    }

    fun perform_holder_count(collection_address: address): u64 {
        // This would integrate with the actual NFT contract to count holders
        // For now, return a placeholder
        // In a real implementation, this would:
        // 1. Query all tokens in the collection
        // 2. Get current owners
        // 3. Count unique addresses
        // 4. Exclude burn addresses
        // 5. Verify minimum holding period
        0
    }

    public fun verify_holder_authenticity(
        holder: address,
        collection_address: address,
        min_holding_period: u64,
    ): bool acquires CollectionRegistry {
        let registry = borrow_global<CollectionRegistry>(@nft_validation);
        
        if (!table::contains(&registry.holders, collection_address)) {
            return false
        };

        let holders = table::borrow(&registry.holders, collection_address);
        let current_time = std::timestamp::now_seconds();
        
        // Find holder in the list
        let i = 0;
        let len = vector::length(holders);
        while (i < len) {
            let holder_info = vector::borrow(holders, i);
            if (holder_info.holder == holder) {
                // Check if holder has held tokens for minimum period
                return (current_time - holder_info.first_acquired) >= min_holding_period
            };
            i = i + 1;
        };

        false
    }

    public fun update_holder_data(
        oracle: &signer,
        collection_address: address,
        holders: vector<HolderInfo>,
    ) acquires CollectionRegistry {
        let registry = borrow_global_mut<CollectionRegistry>(@nft_validation);
        
        // Update holder information
        table::upsert(&mut registry.holders, collection_address, holders);
        
        // Update verified count
        let unique_holders = vector::length(&holders);
        table::upsert(&mut registry.verified_counts, collection_address, unique_holders);
    }

    public fun get_collection_metadata(collection_address: address): (address, String, u64, bool, String) acquires CollectionRegistry {
        let registry = borrow_global<CollectionRegistry>(@nft_validation);
        
        if (table::contains(&registry.collections, collection_address)) {
            let collection = table::borrow(&registry.collections, collection_address);
            (
                collection.creator,
                collection.collection_name,
                collection.total_supply,
                collection.verified,
                collection.metadata_uri
            )
        } else {
            (
                @0x0,
                string::utf8(b""),
                0,
                false,
                string::utf8(b"")
            )
        }
    }

    public fun create_holder_info(
        holder: address,
        token_count: u64,
        first_acquired: u64,
    ): HolderInfo {
        HolderInfo {
            holder,
            token_count,
            first_acquired,
            last_verified: std::timestamp::now_seconds(),
        }
    }

    #[view]
    public fun get_holder_count(collection_address: address): u64 acquires CollectionRegistry {
        count_unique_holders(collection_address)
    }

    #[view]
    public fun is_collection_verified(collection_address: address): bool acquires CollectionRegistry {
        let registry = borrow_global<CollectionRegistry>(@nft_validation);
        
        if (table::contains(&registry.collections, collection_address)) {
            let collection = table::borrow(&registry.collections, collection_address);
            collection.verified
        } else {
            false
        }
    }

    #[view]
    public fun get_holder_info(collection_address: address, holder: address): (u64, u64, u64) acquires CollectionRegistry {
        let registry = borrow_global<CollectionRegistry>(@nft_validation);
        
        if (table::contains(&registry.holders, collection_address)) {
            let holders = table::borrow(&registry.holders, collection_address);
            let i = 0;
            let len = vector::length(holders);
            while (i < len) {
                let holder_info = vector::borrow(holders, i);
                if (holder_info.holder == holder) {
                    return (holder_info.token_count, holder_info.first_acquired, holder_info.last_verified)
                };
                i = i + 1;
            };
        };

        (0, 0, 0)
    }
}
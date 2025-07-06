module nft_validation::bet_types {
    // Bet types
    const BET_TYPE_SUPPORT: u8 = 1;
    const BET_TYPE_DOUBT: u8 = 2;

    public struct Bet has store, copy, drop {
        amount: u64,
        bet_type: u8,
        claimed: bool,
        timestamp: u64,
    }

    public fun create_bet(amount: u64, bet_type: u8, timestamp: u64): Bet {
        Bet {
            amount,
            bet_type,
            claimed: false,
            timestamp,
        }
    }

    public fun get_bet_amount(bet: &Bet): u64 {
        bet.amount
    }

    public fun get_bet_type(bet: &Bet): u8 {
        bet.bet_type
    }

    public fun is_claimed(bet: &Bet): bool {
        bet.claimed
    }

    public fun is_support_bet(bet: &Bet): bool {
        bet.bet_type == BET_TYPE_SUPPORT
    }

    public fun is_doubt_bet(bet: &Bet): bool {
        bet.bet_type == BET_TYPE_DOUBT
    }

    // Sets claimed to true on a mutable Bet
    public fun set_claimed(bet: &mut Bet) {
        bet.claimed = true;
    }

    // Returns a copy of Bet with claimed set to true
    public fun set_claimed_copy(bet: &Bet): Bet {
        Bet {
            amount: bet.amount,
            bet_type: bet.bet_type,
            claimed: true,
            timestamp: bet.timestamp,
        }
    }
} 
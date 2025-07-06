module nft_validation::betting {
    use nft_validation::bet_types::Self;
    use nft_validation::project::{Self, Project};

    // Bet types
    const BET_TYPE_SUPPORT: u8 = 1;
    const BET_TYPE_DOUBT: u8 = 2;

    public fun place_bet(
        project: &mut Project,
        bettor: address,
        amount: u64,
        bet_type: u8,
    ) {
        let timestamp = std::timestamp::now_seconds();
        if (project::has_bet(project, bettor)) {
            // Update existing bet by creating a new Bet with updated amount
            let existing_bet = project::get_bet(project, bettor);
            let new_amount = bet_types::get_bet_amount(existing_bet) + amount;
            let new_bet = bet_types::create_bet(new_amount, bet_types::get_bet_type(existing_bet), timestamp);
            // If the bet was already claimed, preserve that
            let claimed = bet_types::is_claimed(existing_bet);
            let final_bet = if (claimed) { 
                // Mark as claimed if it was already claimed
                bet_types::set_claimed_copy(&new_bet)
            } else { new_bet };
            project::add_bet(project, bettor, final_bet);
        } else {
            // Create new bet
            let bet = bet_types::create_bet(amount, bet_type, timestamp);
            project::add_bet(project, bettor, bet);
        }
    }

    public fun mark_claimed(project: &mut Project, bettor: address) {
        let bet = project::get_bet(project, bettor);
        let new_bet = bet_types::set_claimed_copy(bet);
        project::add_bet(project, bettor, new_bet);
    }

    public fun get_bet_details(project: &Project, bettor: address): (u64, u8, bool) {
        if (project::has_bet(project, bettor)) {
            let bet = project::get_bet(project, bettor);
            (bet_types::get_bet_amount(bet), bet_types::get_bet_type(bet), bet_types::is_claimed(bet))
        } else {
            (0, 0, false)
        }
    }
}
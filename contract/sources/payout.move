module nft_validation::payout {
    use nft_validation::project::{Self, Project};
    use nft_validation::betting;

    // Platform fee in basis points (100 = 1%)
    const PLATFORM_FEE_BPS: u64 = 100;
    const BPS_DENOMINATOR: u64 = 10000;

    public fun calculate_payout(project: &Project, bettor: address): u64 {
        if (!project::has_bet(project, bettor)) {
            return 0
        };

        let (bet_amount, bet_type, is_claimed) = betting::get_bet_details(project, bettor);
        if (is_claimed) {
            return 0
        };

        let is_support = bet_type == 1; // 1 = support, 2 = doubt
        let project_successful = project::is_successful(project);

        // No payout if bet was wrong
        if ((is_support && !project_successful) || (!is_support && project_successful)) {
            return 0
        };

        let total_winning_pool = if (project_successful) {
            project::get_support_pool(project)
        } else {
            project::get_doubt_pool(project)
        };

        let total_losing_pool = if (project_successful) {
            project::get_doubt_pool(project)
        } else {
            project::get_support_pool(project)
        };

        if (total_winning_pool == 0) {
            return 0
        };

        // Calculate platform fee
        let platform_fee = (total_losing_pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
        let distributable_amount = total_losing_pool - platform_fee;

        // Calculate proportional share
        let payout = bet_amount + (bet_amount * distributable_amount) / total_winning_pool;
        payout
    }

    public fun calculate_potential_payout(project: &Project, bettor: address): u64 {
        if (!project::has_bet(project, bettor)) {
            return 0
        };

        let (bet_amount, bet_type, _) = betting::get_bet_details(project, bettor);
        let is_support = bet_type == 1; // 1 = support, 2 = doubt

        let support_pool = project::get_support_pool(project);
        let doubt_pool = project::get_doubt_pool(project);

        if (is_support) {
            if (support_pool == 0) return 0;
            let platform_fee = (doubt_pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            let distributable = doubt_pool - platform_fee;
            bet_amount + (bet_amount * distributable) / support_pool
        } else {
            if (doubt_pool == 0) return 0;
            let platform_fee = (support_pool * PLATFORM_FEE_BPS) / BPS_DENOMINATOR;
            let distributable = support_pool - platform_fee;
            bet_amount + (bet_amount * distributable) / doubt_pool
        }
    }

    public fun calculate_odds(project: &Project): (u64, u64) {
        let support_pool = project::get_support_pool(project);
        let doubt_pool = project::get_doubt_pool(project);
        
        if (support_pool == 0 && doubt_pool == 0) {
            return (100, 100) // 1:1 odds when no bets
        };

        let total_pool = support_pool + doubt_pool;
        let support_odds = if (support_pool == 0) 999 else (total_pool * 100) / support_pool;
        let doubt_odds = if (doubt_pool == 0) 999 else (total_pool * 100) / doubt_pool;

        (support_odds, doubt_odds)
    }
}
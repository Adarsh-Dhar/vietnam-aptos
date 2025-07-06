module nft_validation::project {
    use aptos_std::table::{Self, Table};
    use nft_validation::bet_types::Bet;

    // Project status constants
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_SUCCESS: u8 = 1;
    const STATUS_FAILED: u8 = 2;

    struct Project has store {
        creator: address,
        target_holders: u64,
        deadline: u64,
        support_pool: u64,
        doubt_pool: u64,
        status: u8,
        nft_contract: address,
        metadata_uri: vector<u8>,
        final_holders: u64,
        bets: Table<address, Bet>,
    }

    public fun create_project(
        creator: address,
        target_holders: u64,
        deadline: u64,
        nft_contract: address,
        metadata_uri: vector<u8>,
    ): Project {
        Project {
            creator,
            target_holders,
            deadline,
            support_pool: 0,
            doubt_pool: 0,
            status: STATUS_ACTIVE,
            nft_contract,
            metadata_uri,
            final_holders: 0,
            bets: table::new(),
        }
    }

    public fun add_support(project: &mut Project, amount: u64) {
        project.support_pool = project.support_pool + amount;
    }

    public fun add_doubt(project: &mut Project, amount: u64) {
        project.doubt_pool = project.doubt_pool + amount;
    }

    public fun resolve_project(project: &mut Project, final_holders: u64, success: bool) {
        project.final_holders = final_holders;
        project.status = if (success) STATUS_SUCCESS else STATUS_FAILED;
    }

    public fun add_bet(project: &mut Project, bettor: address, bet: Bet) {
        table::add(&mut project.bets, bettor, bet);
    }

    public fun get_bet_mut(project: &mut Project, bettor: address): &mut Bet {
        table::borrow_mut(&mut project.bets, bettor)
    }

    public fun get_bet(project: &Project, bettor: address): &Bet {
        table::borrow(&project.bets, bettor)
    }

    public fun has_bet(project: &Project, bettor: address): bool {
        table::contains(&project.bets, bettor)
    }

    // View functions
    public fun is_active(project: &Project): bool {
        project.status == STATUS_ACTIVE
    }

    public fun is_resolved(project: &Project): bool {
        project.status != STATUS_ACTIVE
    }

    public fun is_successful(project: &Project): bool {
        project.status == STATUS_SUCCESS
    }

    public fun get_deadline(project: &Project): u64 {
        project.deadline
    }

    public fun get_target_holders(project: &Project): u64 {
        project.target_holders
    }

    public fun get_support_pool(project: &Project): u64 {
        project.support_pool
    }

    public fun get_doubt_pool(project: &Project): u64 {
        project.doubt_pool
    }

    public fun get_total_pool(project: &Project): u64 {
        project.support_pool + project.doubt_pool
    }

    public fun get_creator(project: &Project): address {
        project.creator
    }

    public fun get_nft_contract(project: &Project): address {
        project.nft_contract
    }

    public fun get_final_holders(project: &Project): u64 {
        project.final_holders
    }

    public fun get_project_details(project: &Project): (address, u64, u64, u64, u64, u8, address) {
        (
            project.creator,
            project.target_holders,
            project.deadline,
            project.support_pool,
            project.doubt_pool,
            project.status,
            project.nft_contract
        )
    }
}
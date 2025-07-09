# Betting System Implementation

## Overview

The betting system allows investors to place bets on whether projects will reach their target holder count by the deadline. The system uses dynamic odds calculation and real-time pool management.

## Core Components

### 1. Database Schema Updates

**Project Model Additions:**
- `supportPool`: Total amount bet on SUPPORT
- `doubtPool`: Total amount bet on DOUBT  
- `totalPool`: Combined pool amount
- `platformFee`: Platform fee percentage (default 1%)

**Bet Model Additions:**
- `claimed`: Boolean to track if bet has been claimed
- `odds`: Calculated odds at time of bet

### 2. API Endpoints

#### `/api/projects/[id]/bets` (POST)
Places a bet on a project.

**Request Body:**
```json
{
  "amount": 10.5,
  "type": "SUPPORT" // or "DOUBT"
}
```

**Response:**
```json
{
  "bet": { /* bet object */ },
  "updatedPools": {
    "supportPool": 2450,
    "doubtPool": 1200,
    "totalPool": 3650
  },
  "odds": 2.3
}
```

#### `/api/projects/[id]/odds` (GET)
Gets real-time odds and pool information.

**Response:**
```json
{
  "project": { /* project info */ },
  "pools": {
    "supportPool": 2450,
    "doubtPool": 1200,
    "totalPool": 3650
  },
  "odds": {
    "support": "2.30",
    "doubt": "1.80"
  },
  "stats": {
    "totalBets": 150,
    "supportBets": 98,
    "doubtBets": 52,
    "uniqueBettors": 45
  },
  "recentBets": [ /* last 10 bets */ ]
}
```

#### `/api/projects/[id]/live` (GET)
Gets comprehensive live project data including time remaining and progress.

#### `/api/projects/[id]/validate` (POST)
Resolves a project and calculates payouts (admin only).

**Request Body:**
```json
{
  "finalHolders": 1200
}
```

#### `/api/users/[id]/bets` (GET)
Gets user's betting history and portfolio stats.

#### `/api/payouts` (GET)
Gets user's payout history.

#### `/api/payouts/[id]/claim` (POST)
Claims a payout with transaction hash.

### 3. Odds Calculation

**Dynamic Odds Formula:**
```
Support Odds = Total Pool / (Support Pool + 1)
Doubt Odds = Total Pool / (Doubt Pool + 1)
```

**Example Progression:**
| Time | Support Pool | Doubt Pool | Support Odds | Doubt Odds |
|------|--------------|------------|--------------|------------|
| Start| 0 APT        | 0 APT      | 1:1          | 1:1        |
| Bet1 | 50 APT       | -          | 1.02:1       | 0.98:1     |
| Bet2 | -            | 30 APT     | 1.55:1       | 0.65:1     |

### 4. Payout Calculation

**When Project Resolves:**

1. **Platform Fee:** 1% of total pool
2. **Winners Pool:** Total pool - platform fee
3. **Individual Payout:** `(Individual Bet / Winning Pool Total) × Winners Pool`

**Example:**
- Target: 500 holders
- Actual: 550 holders (SUCCESS)
- Support Pool: 70 APT
- Doubt Pool: 30 APT
- Alice (SUPPORTER, 20 APT):
  ```
  Payout = (20 / 70) × (100 - 1) = 28.29 APT
  ```

### 5. Frontend Integration

#### Betting Modal
- Real-time odds display
- Amount slider (1-100 APT)
- Potential return calculation
- Bet type selection (SUPPORT/DOUBT)

#### Pool Visualization
- Animated pool bars
- Real-time updates
- Color-coded (green for support, red for doubt)

#### Portfolio Tracking
- Total invested
- Active bets
- Success rate
- Total returns

### 6. User Experience Flow

1. **Browse Projects:** View active projects with current odds
2. **Select Project:** Click Support/Doubt button
3. **Place Bet:** Use modal to set amount and confirm
4. **Real-time Updates:** See odds change immediately
5. **Wait for Resolution:** Project resolves at deadline
6. **Claim Winnings:** Winners can claim payouts

### 7. Security Features

- **Authentication:** JWT-based user authentication
- **Authorization:** Role-based access control
- **Validation:** Input validation and sanitization
- **Rate Limiting:** Prevent spam betting
- **Audit Trail:** All bets and payouts logged

### 8. Economic Safeguards

- **Minimum Bet:** 1 APT
- **Maximum Bet:** 100 APT (configurable)
- **Platform Fee:** 1% (configurable)
- **Deadline Enforcement:** No bets after deadline
- **Status Validation:** Only active projects accept bets

### 9. Real-time Features

- **Live Odds:** Update with each bet
- **Pool Visualization:** Animated bars
- **Recent Bets:** Live feed of recent activity
- **Time Remaining:** Countdown timer
- **Progress Tracking:** Holder count progress

### 10. Admin Functions

- **Project Validation:** Resolve projects with final holder count
- **Manual Resolution:** Override automatic resolution if needed
- **Fee Management:** Adjust platform fees
- **Audit Reports:** Generate betting activity reports

## Usage Examples

### Place a Bet
```javascript
const response = await fetch('/api/projects/123/bets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 25,
    type: 'SUPPORT'
  })
})
```

### Get Live Odds
```javascript
const response = await fetch('/api/projects/123/odds')
const data = await response.json()
console.log(`Support odds: ${data.odds.support}:1`)
console.log(`Doubt odds: ${data.odds.doubt}:1`)
```

### Validate Project (Admin)
```javascript
const response = await fetch('/api/projects/123/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    finalHolders: 1200
  })
})
```

## Future Enhancements

1. **WebSocket Integration:** Real-time updates without polling
2. **Advanced Analytics:** Betting patterns and market analysis
3. **Social Features:** Share bets and results
4. **Mobile App:** Native mobile betting interface
5. **Advanced Odds:** More sophisticated pricing models
6. **Tournaments:** Competitive betting events
7. **NFT Integration:** Bet with project NFTs
8. **Cross-chain:** Support for multiple blockchains 
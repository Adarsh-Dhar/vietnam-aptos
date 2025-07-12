import { NextRequest, NextResponse } from 'next/server'
import { getUserPortfolio, getBetDetails } from '@/lib/contract'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      )
    }
    
    const userBets = await getUserPortfolio(address)
    
    // Calculate portfolio stats
    const totalInvested = userBets.reduce((sum, bet) => {
      const amount = Array.isArray(bet.betDetails) && bet.betDetails[0] && typeof bet.betDetails[0] === 'number' 
        ? bet.betDetails[0] / 1000000 
        : 0
      return sum + amount
    }, 0)
    const activeBets = userBets.filter(bet => bet.project && Array.isArray(bet.project) && bet.project[2] === 0).length // Status 0 = active
    const successfulBets = userBets.filter(bet => bet.project && Array.isArray(bet.project) && bet.project[2] === 1).length // Status 1 = success
    const failedBets = userBets.filter(bet => bet.project && Array.isArray(bet.project) && bet.project[2] === 2).length // Status 2 = failed
    
    const totalResolved = successfulBets + failedBets
    const successRate = totalResolved > 0 ? (successfulBets / totalResolved) * 100 : 0
    
    return NextResponse.json({
      bets: userBets,
      portfolio: {
        totalBets: userBets.length,
        totalInvested,
        activeBets,
        successfulBets,
        failedBets,
        successRate: successRate.toFixed(1),
        totalPayouts: 0 // TODO: Calculate from contract
      }
    })
  } catch (error) {
    console.error('Get user portfolio error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user portfolio from contract' },
      { status: 500 }
    )
  }
} 
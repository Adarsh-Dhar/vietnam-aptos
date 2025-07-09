import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { authenticateUser } from '../../../../../lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await authenticateUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only allow admin or oracle to validate projects
    if (!authUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can validate projects' },
        { status: 403 }
      )
    }

    const { finalHolders } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        bets: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Project is not active' },
        { status: 400 }
      )
    }

    if (new Date() < project.deadline) {
      return NextResponse.json(
        { error: 'Project deadline has not been reached' },
        { status: 400 }
      )
    }

    // Calculate pools
    const supportPool = project.bets
      .filter(bet => bet.type === 'SUPPORT')
      .reduce((sum, bet) => sum + bet.amount, 0)
    
    const doubtPool = project.bets
      .filter(bet => bet.type === 'DOUBT')
      .reduce((sum, bet) => sum + bet.amount, 0)

    const totalPool = supportPool + doubtPool
    const platformFeeAmount = totalPool * 0.01 // 1% platform fee

    // Determine project status
    const isSuccess = finalHolders >= project.targetHolders
    const status = isSuccess ? 'SUCCESS' : 'FAILURE'

    // Update project status and final holders
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        status,
        currentHolders: finalHolders,
        supportPool,
        doubtPool,
        totalPool,
        platformFee: platformFeeAmount
      }
    })

    // Create validation record
    const validation = await prisma.validation.create({
      data: {
        projectId: params.id,
        finalHolders,
        supportPool,
        doubtPool,
        totalPool,
        platformFee: platformFeeAmount,
        processedAt: new Date()
      }
    })

    // Calculate and create payouts for winners
    const winnersPool = totalPool - platformFeeAmount
    const winningBets = project.bets.filter(bet => {
      if (status === 'SUCCESS') {
        return bet.type === 'SUPPORT'
      } else {
        return bet.type === 'DOUBT'
      }
    })

    const winningPoolTotal = winningBets.reduce((sum, bet) => sum + bet.amount, 0)

    // Create payouts for each winning bet
    const payouts = []
    for (const bet of winningBets) {
      const payoutAmount = (bet.amount / winningPoolTotal) * winnersPool
      
      const payout = await prisma.payout.create({
        data: {
          userId: bet.userId,
          projectId: params.id,
          amount: payoutAmount,
          type: bet.type
        }
      })
      payouts.push(payout)
    }

    // Update user reputations based on success
    const allBettors = [...new Set(project.bets.map(bet => bet.userId))]
    for (const userId of allBettors) {
      const userBets = project.bets.filter(bet => bet.userId === userId)
      const hasWinningBet = userBets.some(bet => {
        if (status === 'SUCCESS') {
          return bet.type === 'SUPPORT'
        } else {
          return bet.type === 'DOUBT'
        }
      })

      const reputationChange = hasWinningBet ? 10 : -5
      
      await prisma.user.update({
        where: { id: userId },
        data: {
          reputation: {
            increment: reputationChange
          }
        }
      })
    }

    return NextResponse.json({
      project: updatedProject,
      validation,
      payouts,
      totalPayouts: payouts.length,
      totalPayoutAmount: winnersPool
    })
  } catch (error) {
    console.error('Validate project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

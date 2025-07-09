import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                aptosAddress: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            aptosAddress: true,
            reputation: true
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate current pools
    const supportPool = project.bets
      .filter(bet => bet.type === 'SUPPORT')
      .reduce((sum, bet) => sum + bet.amount, 0)
    
    const doubtPool = project.bets
      .filter(bet => bet.type === 'DOUBT')
      .reduce((sum, bet) => sum + bet.amount, 0)

    const totalPool = supportPool + doubtPool

    // Calculate current odds
    const supportOdds = totalPool > 0 ? totalPool / (supportPool + 1) : 1
    const doubtOdds = totalPool > 0 ? totalPool / (doubtPool + 1) : 1

    // Calculate time remaining
    const now = new Date()
    const deadline = new Date(project.deadline)
    const timeRemaining = Math.max(0, deadline.getTime() - now.getTime())
    const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24))
    const hoursRemaining = Math.ceil((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    // Calculate progress percentage
    const progressPercentage = Math.min(100, (project.currentHolders / project.targetHolders) * 100)

    // Get recent bets (last 10)
    const recentBets = project.bets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    // Calculate betting stats
    const supportBets = project.bets.filter(bet => bet.type === 'SUPPORT').length
    const doubtBets = project.bets.filter(bet => bet.type === 'DOUBT').length
    const uniqueBettors = new Set(project.bets.map(bet => bet.userId)).size

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        targetHolders: project.targetHolders,
        currentHolders: project.currentHolders,
        progressPercentage,
        deadline: project.deadline,
        status: project.status,
        timeRemaining: {
          days: daysRemaining,
          hours: hoursRemaining,
          total: timeRemaining
        },
        creator: project.creator
      },
      pools: {
        supportPool,
        doubtPool,
        totalPool
      },
      odds: {
        support: supportOdds.toFixed(2),
        doubt: doubtOdds.toFixed(2)
      },
      stats: {
        totalBets: project.bets.length,
        supportBets,
        doubtBets,
        uniqueBettors
      },
      recentBets
    })
  } catch (error) {
    console.error('Get live project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
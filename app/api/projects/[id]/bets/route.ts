import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { authenticateUser } from '../../../../../lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context
    if (!params || !params.id) {
      return NextResponse.json({ error: 'Missing project id in params' }, { status: 400 })
    }
    const projectId = params.id

    const authUser = await authenticateUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, type } = await request.json()

    if (!amount || !type || (type !== 'SUPPORT' && type !== 'DOUBT')) {
      return NextResponse.json(
        { error: 'Invalid bet data' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
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

    if (new Date() > project.deadline) {
      return NextResponse.json(
        { error: 'Project deadline has passed' },
        { status: 400 }
      )
    }

    // Calculate current pools
    const supportPool = project.bets
      .filter((bet: { type: string }) => bet.type === 'SUPPORT')
      .reduce((sum: any, bet: { amount: any }) => sum + bet.amount, 0)
    
    const doubtPool = project.bets
      .filter((bet: { type: string }) => bet.type === 'DOUBT')
      .reduce((sum: any, bet: { amount: any }) => sum + bet.amount, 0)

    const totalPool = supportPool + doubtPool + amount

    // Calculate odds based on the new bet
    let odds: number
    if (type === 'SUPPORT') {
      const newSupportPool = supportPool + amount
      odds = totalPool / newSupportPool
    } else {
      const newDoubtPool = doubtPool + amount
      odds = totalPool / newDoubtPool
    }

    // Create or update bet
    const bet = await prisma.bet.upsert({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: authUser.id
        }
      },
      update: {
        amount: { increment: amount },
        odds
      },
      create: {
        projectId: projectId,
        userId: authUser.id,
        amount,
        type,
        odds
      }
    })

    // Update project pools
    const newSupportPool = type === 'SUPPORT' ? supportPool + amount : supportPool
    const newDoubtPool = type === 'DOUBT' ? doubtPool + amount : doubtPool
    const newTotalPool = newSupportPool + newDoubtPool

    await prisma.project.update({
      where: { id: projectId },
      data: {
        supportPool: newSupportPool,
        doubtPool: newDoubtPool,
        totalPool: newTotalPool
      } as any // Cast to any to bypass Prisma type error if needed
    })

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: '1' },
      update: {
        totalVolume: { increment: amount }
      },
      create: {
        totalVolume: amount
      }
    })

    return NextResponse.json({
      bet,
      updatedPools: {
        supportPool: newSupportPool,
        doubtPool: newDoubtPool,
        totalPool: newTotalPool
      },
      odds
    })
  } catch (error) {
    console.error('Create bet error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

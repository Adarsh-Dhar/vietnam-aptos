import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { authenticateUser } from '../../../../../lib/auth'

export async function GET(
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

    // Users can only view their own bets unless they're admin
    if (authUser.id !== params.id && !authUser.roles.includes('ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    const where: any = { userId: params.id }
    if (status) {
      where.project = { status }
    }

    const bets = await prisma.bet.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            targetHolders: true,
            currentHolders: true,
            deadline: true,
            creator: {
              select: {
                username: true,
                aptosAddress: true
              }
            }
          }
        }
      }
    })

    // Calculate portfolio stats
    const totalBets = await prisma.bet.count({ where: { userId: params.id } })
    const totalInvested = await prisma.bet.aggregate({
      where: { userId: params.id },
      _sum: { amount: true }
    })

    const activeBets = await prisma.bet.count({
      where: {
        userId: params.id,
        project: { status: 'ACTIVE' }
      }
    })

    const successfulBets = await prisma.bet.count({
      where: {
        userId: params.id,
        project: { status: 'SUCCESS' }
      }
    })

    const failedBets = await prisma.bet.count({
      where: {
        userId: params.id,
        project: { status: 'FAILURE' }
      }
    })

    // Calculate success rate
    const totalResolved = successfulBets + failedBets
    const successRate = totalResolved > 0 ? (successfulBets / totalResolved) * 100 : 0

    // Get total payouts
    const totalPayouts = await prisma.payout.aggregate({
      where: { userId: params.id },
      _sum: { amount: true }
    })

    return NextResponse.json({
      bets,
      portfolio: {
        totalBets,
        totalInvested: totalInvested._sum.amount || 0,
        activeBets,
        successfulBets,
        failedBets,
        successRate: successRate.toFixed(1),
        totalPayouts: totalPayouts._sum.amount || 0
      }
    })
  } catch (error) {
    console.error('Get user bets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
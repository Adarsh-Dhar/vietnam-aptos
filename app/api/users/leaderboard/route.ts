import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const users = await prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { reputation: 'desc' },
      include: {
        _count: {
          select: {
            createdProjects: true,
            bets: true
          }
        }
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

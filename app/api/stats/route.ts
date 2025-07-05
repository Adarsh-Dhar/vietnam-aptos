import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    let stats = await prisma.platformStats.findUnique({
      where: { id: '1' }
    })

    if (!stats) {
      // Calculate stats if not exists
      const totalProjects = await prisma.project.count()
      const activeProjects = await prisma.project.count({
        where: { status: 'ACTIVE' }
      })
      const successfulProjects = await prisma.project.count({
        where: { status: 'SUCCESS' }
      })
      
      const totalVolume = await prisma.bet.aggregate({
        _sum: { amount: true }
      })

      const totalPayouts = await prisma.payout.aggregate({
        _sum: { amount: true }
      })

      const avgSuccessRate = totalProjects > 0 ? (successfulProjects / totalProjects) * 100 : 0

      stats = await prisma.platformStats.create({
        data: {
          totalProjects,
          activeProjects,
          totalVolume: totalVolume._sum.amount || 0,
          avgSuccessRate,
          totalPayouts: totalPayouts._sum.amount || 0,
          platformEarnings: (totalVolume._sum.amount || 0) * 0.01
        }
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

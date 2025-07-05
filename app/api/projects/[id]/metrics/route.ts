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

    const { holderCount, volume, avgPrice } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.creatorId !== authUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const metric = await prisma.metric.create({
      data: {
        projectId: params.id,
        holderCount: holderCount || 0,
        volume: volume || 0,
        avgPrice: avgPrice || 0
      }
    })

    // Update project's current holders
    await prisma.project.update({
      where: { id: params.id },
      data: {
        currentHolders: holderCount || 0
      }
    })

    return NextResponse.json(metric)
  } catch (error) {
    console.error('Create metric error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

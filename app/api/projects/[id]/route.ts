import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            aptosAddress: true,
            reputation: true
          }
        },
        categories: true,
        bets: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                aptosAddress: true,
                reputation: true
              }
            }
          }
        },
        metrics: {
          orderBy: { timestamp: 'desc' },
          take: 100
        },
        validation: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Calculate pools
    const supportPool = project.bets
      .filter(bet => bet.type === 'SUPPORT')
      .reduce((sum, bet) => sum + bet.amount, 0)
    
    const doubtPool = project.bets
      .filter(bet => bet.type === 'DOUBT')
      .reduce((sum, bet) => sum + bet.amount, 0)

    return NextResponse.json({
      ...project,
      supportPool,
      doubtPool,
      totalPool: supportPool + doubtPool
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const { name, description, coverImage, currentHolders, status, deadline } = await request.json()

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description,
        coverImage,
        currentHolders,
        status,
        deadline: deadline ? new Date(deadline) : undefined
      }
    })

    // Add metric if currentHolders is updated
    if (currentHolders !== undefined) {
      await prisma.metric.create({
        data: {
          projectId: params.id,
          holderCount: currentHolders,
          volume: 0, // You might want to calculate this
          avgPrice: 0 // You might want to calculate this
        }
      })
    }

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
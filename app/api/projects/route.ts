import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { authenticateUser } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/projects - Starting request')
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    console.log('Search params:', { limit, offset, status, category, search })

    const where: any = {}
    if (status) where.status = status
    if (category) {
      where.categories = {
        some: { name: category }
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    console.log('Database query where clause:', where)

    // Test database connection first
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    const projects = await prisma.project.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
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
        selectedNFT: {
          select: {
            id: true,
            tokenName: true,
            collectionName: true,
            collectionAddress: true,
            tokenAddress: true,
            imageUrl: true,
            mintTxHash: true
          }
        },
        _count: {
          select: { bets: true }
        },
        bets: {
          select: {
            amount: true,
            type: true
          }
        }
      }
    })

    console.log(`Found ${projects.length} projects`)

    // Calculate pools for each project
    const projectsWithPools = projects.map(project => {
      const supportPool = project.bets
        .filter(bet => bet.type === 'SUPPORT')
        .reduce((sum, bet) => sum + bet.amount, 0)
      
      const doubtPool = project.bets
        .filter(bet => bet.type === 'DOUBT')
        .reduce((sum, bet) => sum + bet.amount, 0)

      return {
        ...project,
        supportPool,
        doubtPool,
        totalPool: supportPool + doubtPool
      }
    })

    console.log('Returning projects with pools')
    return NextResponse.json(projectsWithPools)
  } catch (error) {
    console.error('Get projects error:', error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await authenticateUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const {
      aptosContract,
      name,
      description,
      coverImage,
      listingFee,
      targetHolders,
      deadline,
      categories,
      selectedNFTId,
      contractProjectId
    } = await request.json()

    // Validate required fields
    if (!aptosContract || !name || !description || !targetHolders || !deadline) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        creatorId: authUser.id,
        aptosContract,
        contractProjectId: contractProjectId || null,
        name,
        description,
        coverImage,
        listingFee: listingFee || 10,
        targetHolders,
        deadline: new Date(deadline),
        selectedNFTId: selectedNFTId || null,
        categories: {
          connectOrCreate: categories?.map((cat: string) => ({
            where: { name: cat },
            create: { name: cat }
          })) || []
        }
      },
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
        selectedNFT: {
          select: {
            id: true,
            tokenName: true,
            collectionName: true,
            imageUrl: true,
            mintTxHash: true
          }
        }
      }
    })

    // Update platform stats
    await prisma.platformStats.upsert({
      where: { id: '1' },
      update: {
        totalProjects: { increment: 1 },
        activeProjects: { increment: 1 }
      },
      create: {
        totalProjects: 1,
        activeProjects: 1
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    // Type-narrowing for Prisma error
    if (
      typeof error === 'object' && error !== null &&
      'code' in error &&
      (error as any).code === 'P2002' &&
      'meta' in error &&
      (error as any).meta &&
      (error as any).meta.target &&
      (error as any).meta.target.includes('aptosContract')
    ) {
      return NextResponse.json(
        { error: 'A project with this Aptos contract address already exists. Please use a unique contract address.' },
        { status: 409 }
      )
    }
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
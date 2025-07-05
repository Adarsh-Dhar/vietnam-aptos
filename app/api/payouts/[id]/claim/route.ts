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

    const { txHash } = await request.json()

    const payout = await prisma.payout.findUnique({
      where: { id: params.id }
    })

    if (!payout) {
      return NextResponse.json(
        { error: 'Payout not found' },
        { status: 404 }
      )
    }

    if (payout.userId !== authUser.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    if (payout.txHash) {
      return NextResponse.json(
        { error: 'Payout already claimed' },
        { status: 400 }
      )
    }

    const updatedPayout = await prisma.payout.update({
      where: { id: params.id },
      data: { txHash }
    })

    return NextResponse.json(updatedPayout)
  } catch (error) {
    console.error('Claim payout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
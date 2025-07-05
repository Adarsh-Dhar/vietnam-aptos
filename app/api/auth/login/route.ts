import { NextRequest, NextResponse } from 'next/server'
import { prisma } from "../../../../lib/prisma"
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { aptosAddress, signature } = await request.json()

    if (!aptosAddress || !signature) {
      return NextResponse.json(
        { error: 'Aptos address and signature required' },
        { status: 400 }
      )
    }

    // Verify signature (implement your Aptos signature verification logic)
    // This is a placeholder - implement actual signature verification
    const isValidSignature = true // await verifyAptosSignature(aptosAddress, signature)

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { aptosAddress }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          aptosAddress,
          roles: ['FOUNDER']
        }
      })
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        aptosAddress: user.aptosAddress,
        roles: user.roles 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return NextResponse.json({ token, user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

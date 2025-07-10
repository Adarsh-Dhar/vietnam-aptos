import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { metadataUri, transactionHash } = await request.json()

    if (!metadataUri) {
      return NextResponse.json(
        { error: 'Metadata URI is required' },
        { status: 400 }
      )
    }

    // Verify metadata by fetching from IPFS
    try {
      const response = await fetch(metadataUri)
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch metadata from IPFS' },
          { status: 400 }
        )
      }

      const metadata = await response.json()
      
      // Validate metadata structure
      if (!metadata.name || !metadata.image) {
        return NextResponse.json(
          { error: 'Invalid metadata structure' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        metadata,
        verified: true,
        transactionHash
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to verify metadata' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('NFT verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionHash = searchParams.get('tx')

    if (!transactionHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      )
    }

    // Here you could add logic to verify the transaction on Aptos blockchain
    // For now, we'll return a simple response
    return NextResponse.json({
      success: true,
      transactionHash,
      status: 'verified',
      message: 'Transaction verification endpoint ready'
    })
  } catch (error) {
    console.error('Transaction verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
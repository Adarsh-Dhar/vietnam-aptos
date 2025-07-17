import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { coinAddress, transactionHash } = await request.json();

    if (!coinAddress) {
      return NextResponse.json(
        { error: 'Coin address is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate with actual blockchain verification
    // For now, return mock verification data
    const verificationData = {
      verified: true,
      contractAddress: coinAddress,
      deploymentTx: transactionHash || '0x1234567890abcdef...',
      contractType: 'Memecoin',
      totalSupply: '1000000000000',
      decimals: 8,
      creator: '0x1234567890abcdef...',
      deploymentTime: new Date().toISOString(),
      blockchainData: {
        name: 'Mock Memecoin',
        symbol: 'MOCK',
        totalSupply: '1000000000000',
        holders: 150,
        liquidity: 50000,
        marketCap: 100000
      }
    };

    // Update memecoin status if verification is successful
    if (verificationData.verified) {
      await prisma.memecoin.updateMany({
        where: { coinAddress },
        data: {
          status: 'DEPLOYED',
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      verification: verificationData,
      verified: verificationData.verified
    });

  } catch (error) {
    console.error('Memecoin verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coinAddress = searchParams.get('coinAddress');
    const memecoinId = searchParams.get('memecoinId');

    if (!coinAddress && !memecoinId) {
      return NextResponse.json(
        { error: 'Either coinAddress or memecoinId is required' },
        { status: 400 }
      );
    }

    let memecoin;
    
    if (memecoinId) {
      memecoin = await prisma.memecoin.findUnique({
        where: { id: memecoinId }
      });
    } else if (coinAddress) {
      memecoin = await prisma.memecoin.findFirst({
        where: { coinAddress }
      });
    }

    if (!memecoin) {
      return NextResponse.json(
        { error: 'Memecoin not found' },
        { status: 404 }
      );
    }

    // Return verification status
    const verificationStatus = {
      verified: memecoin.status === 'DEPLOYED',
      status: memecoin.status,
      coinAddress: memecoin.coinAddress,
      deployTxHash: memecoin.deployTxHash,
      lastVerified: memecoin.updatedAt,
      contractDetails: {
        name: memecoin.coinName,
        symbol: memecoin.coinSymbol,
        totalSupply: memecoin.totalSupply,
        holders: memecoin.holders
      }
    };

    return NextResponse.json({
      success: true,
      verificationStatus
    });

  } catch (error) {
    console.error('Error fetching memecoin verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
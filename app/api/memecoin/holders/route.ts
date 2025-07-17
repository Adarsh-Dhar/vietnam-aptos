import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // TODO: Integrate with actual blockchain API to get real holder count
    // For now, return mock data or use existing holder count from database
    const holderData = {
      totalHolders: memecoin.holders || 0,
      uniqueAddresses: memecoin.holders || 0,
      topHolders: [
        {
          address: '0x1234567890abcdef...',
          balance: '1000000',
          percentage: 10.5
        },
        {
          address: '0xabcdef1234567890...',
          balance: '500000',
          percentage: 5.25
        }
      ],
      distribution: {
        holders1to10: 45,
        holders11to100: 30,
        holders101to1000: 20,
        holders1000plus: 5
      },
      lastUpdated: new Date().toISOString(),
      coinAddress: memecoin.coinAddress,
      coinSymbol: memecoin.coinSymbol
    };

    return NextResponse.json({
      success: true,
      holderData,
      memecoin: {
        id: memecoin.id,
        coinName: memecoin.coinName,
        coinSymbol: memecoin.coinSymbol,
        status: memecoin.status
      }
    });

  } catch (error) {
    console.error('Error fetching memecoin holders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memecoinId, holderCount } = body;

    if (!memecoinId || holderCount === undefined) {
      return NextResponse.json(
        { error: 'Memecoin ID and holder count are required' },
        { status: 400 }
      );
    }

    const updatedMemecoin = await prisma.memecoin.update({
      where: { id: memecoinId },
      data: {
        holders: holderCount,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      memecoin: updatedMemecoin
    });

  } catch (error) {
    console.error('Error updating memecoin holder count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
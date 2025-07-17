import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // TODO: Integrate with actual price feed API
    // For now, return mock data or fetch from blockchain
    const mockPriceData = {
      currentPrice: memecoin.currentPrice || 0.0001,
      marketCap: memecoin.marketCap || 10000,
      volume24h: memecoin.volume24h || 5000,
      priceChange24h: Math.random() * 20 - 10, // Random price change between -10% and +10%
      holders: memecoin.holders || 0,
      totalSupply: memecoin.totalSupply,
      coinAddress: memecoin.coinAddress,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      priceData: mockPriceData,
      memecoin: {
        id: memecoin.id,
        coinName: memecoin.coinName,
        coinSymbol: memecoin.coinSymbol,
        status: memecoin.status
      }
    });

  } catch (error) {
    console.error('Error fetching memecoin price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memecoinId, currentPrice, marketCap, volume24h, holders } = body;

    if (!memecoinId) {
      return NextResponse.json(
        { error: 'Memecoin ID is required' },
        { status: 400 }
      );
    }

    const updatedMemecoin = await prisma.memecoin.update({
      where: { id: memecoinId },
      data: {
        currentPrice: currentPrice || undefined,
        marketCap: marketCap || undefined,
        volume24h: volume24h || undefined,
        holders: holders || undefined,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      memecoin: updatedMemecoin
    });

  } catch (error) {
    console.error('Error updating memecoin price:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
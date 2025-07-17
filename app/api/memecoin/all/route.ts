import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('=== Fetching All Memecoins ===');
    
    // First, let's check all memecoins regardless of status
    const allMemecoins = await prisma.memecoin.findMany({
      include: {
        creator: {
          select: {
            id: true,
            aptosAddress: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📊 All memecoins in database:', allMemecoins.map(m => ({
      id: m.id,
      name: m.coinName,
      symbol: m.coinSymbol,
      status: m.status,
      createdAt: m.createdAt
    })));
    
    // Now filter for deployed memecoins
    const deployedMemecoins = await prisma.memecoin.findMany({
      where: { status: 'DEPLOYED' },
      include: {
        creator: {
          select: {
            id: true,
            aptosAddress: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('✅ Deployed memecoins found:', deployedMemecoins.length);
    console.log('🎯 Deployed memecoins:', deployedMemecoins.map(m => ({
      id: m.id,
      name: m.coinName,
      symbol: m.coinSymbol,
      status: m.status,
      createdAt: m.createdAt
    })));
    
    return NextResponse.json({ success: true, memecoins: deployedMemecoins });
  } catch (error) {
    console.error('❌ Error fetching all memecoins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
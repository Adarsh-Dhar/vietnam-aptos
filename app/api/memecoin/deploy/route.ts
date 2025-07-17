import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Memecoin Deploy API Request ===');
    console.log('📥 Received POST request to /api/memecoin/deploy');
    
    const user = await authenticateUser(request);
    
    if (!user) {
      console.error('❌ Unauthorized request - no valid user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', {
      id: user.id,
      aptosAddress: user.aptosAddress
    });

    const body = await request.json();
    const {
      coinName,
      coinSymbol,
      coinDescription,
      totalSupply,
      initialPrice,
      logoUrl,
      websiteUrl,
      telegramUrl,
      twitterUrl,
      deployTxHash,
      coinAddress,
      status = 'DEPLOYING'
    } = body;

    console.log('📊 Memecoin Data received:', {
      coinName,
      coinSymbol,
      status,
      deployTxHash: deployTxHash ? `${deployTxHash.slice(0, 8)}...` : null,
      totalSupply
    });

    // Validate required fields
    if (!coinName || !coinSymbol || !totalSupply) {
      console.error('❌ Missing required fields:', { coinName, coinSymbol, totalSupply });
      return NextResponse.json(
        { error: 'Missing required fields: coinName, coinSymbol, totalSupply' },
        { status: 400 }
      );
    }

    console.log('✅ Required fields validation passed');

    // Find user by ID from JWT
    console.log('🔍 Looking up user in database...');
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      console.error('❌ User not found in database:', user.id);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found in database:', {
      id: dbUser.id,
      aptosAddress: dbUser.aptosAddress,
      username: dbUser.username
    });

    // Create Memecoin record
    console.log('💾 Creating Memecoin record in database...');
    const memecoin = await prisma.memecoin.create({
      data: {
        creatorId: user.id,
        coinName,
        coinSymbol,
        coinDescription: coinDescription || null,
        totalSupply,
        initialPrice: initialPrice || null,
        currentPrice: initialPrice || null,
        marketCap: null,
        volume24h: null,
        holders: 0,
        deployTxHash: deployTxHash || null,
        coinAddress: coinAddress || null,
        status: status as any,
        logoUrl: logoUrl || null,
        websiteUrl: websiteUrl || null,
        telegramUrl: telegramUrl || null,
        twitterUrl: twitterUrl || null
      },
      include: {
        creator: {
          select: {
            id: true,
            aptosAddress: true,
            username: true
          }
        }
      }
    });

    console.log('✅ Memecoin record created successfully:', {
      id: memecoin.id,
      coinName: memecoin.coinName,
      coinSymbol: memecoin.coinSymbol,
      status: memecoin.status,
      createdAt: memecoin.createdAt,
      creatorAddress: memecoin.creator.aptosAddress
    });

    console.log('=== Memecoin Deployment Complete ===');
    console.log('🎯 Final Memecoin Record:', {
      id: memecoin.id,
      creator: memecoin.creator.aptosAddress,
      coin: memecoin.coinName,
      symbol: memecoin.coinSymbol,
      status: memecoin.status,
      deployTx: memecoin.deployTxHash ? `${memecoin.deployTxHash.slice(0, 8)}...` : 'N/A',
      createdAt: new Date(memecoin.createdAt).toLocaleString()
    });

    return NextResponse.json({
      success: true,
      memecoin
    });

  } catch (error) {
    console.error('Memecoin deployment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {};
    
    if (userId) {
      where.creatorId = userId;
    } else {
      // If no specific userId, show user's own memecoins
      where.creatorId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const memecoins = await prisma.memecoin.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            aptosAddress: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      memecoins
    });

  } catch (error) {
    console.error('Error fetching memecoins:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
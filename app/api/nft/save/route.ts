import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('=== NFT Save API Request ===');
    console.log('📥 Received POST request to /api/nft/save');
    
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
      collectionName,
      collectionDescription,
      collectionUri,
      tokenName,
      tokenDescription,
      tokenUri,
      imageUrl,
      collectionTxHash,
      mintTxHash,
      aptosTokenId,
      aptosCollectionId,
      status = 'MINTING'
    } = body;

    console.log('📊 NFT Data received:', {
      collectionName,
      tokenName,
      status,
      collectionTxHash: collectionTxHash ? `${collectionTxHash.slice(0, 8)}...` : null,
      mintTxHash: mintTxHash ? `${mintTxHash.slice(0, 8)}...` : null
    });

    // Validate required fields
    if (!collectionName || !tokenName || !tokenUri) {
      console.error('❌ Missing required fields:', { collectionName, tokenName, tokenUri });
      return NextResponse.json(
        { error: 'Missing required fields: collectionName, tokenName, tokenUri' },
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

    // Create NFT record
    console.log('💾 Creating NFT record in database...');
    const nft = await prisma.nFT.create({
      data: {
        creatorId: user.id,
        collectionName,
        collectionDescription: collectionDescription || '',
        collectionUri: collectionUri || '',
        tokenName,
        tokenDescription: tokenDescription || null,
        tokenUri,
        imageUrl: imageUrl || null,
        collectionTxHash: collectionTxHash || null,
        mintTxHash: mintTxHash || null,
        aptosTokenId: aptosTokenId || null,
        aptosCollectionId: aptosCollectionId || null,
        status: status as any
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

    console.log('✅ NFT record created successfully:', {
      id: nft.id,
      collectionName: nft.collectionName,
      tokenName: nft.tokenName,
      status: nft.status,
      createdAt: nft.createdAt,
      creatorAddress: nft.creator.aptosAddress
    });

    console.log('=== NFT Storage Complete ===');
    console.log('🎯 Final NFT Record:', {
      id: nft.id,
      creator: nft.creator.aptosAddress,
      collection: nft.collectionName,
      token: nft.tokenName,
      status: nft.status,
      mintTx: nft.mintTxHash ? `${nft.mintTxHash.slice(0, 8)}...` : 'N/A',
      collectionTx: nft.collectionTxHash ? `${nft.collectionTxHash.slice(0, 8)}...` : 'N/A',
      createdAt: new Date(nft.createdAt).toLocaleString()
    });

    return NextResponse.json({
      success: true,
      nft
    });

  } catch (error) {
    console.error('❌ Error in NFT save API:', error);
    console.error('🔍 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
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
      // If no specific userId, show user's own NFTs
      where.creatorId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const nfts = await prisma.nFT.findMany({
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
      nfts
    });

  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
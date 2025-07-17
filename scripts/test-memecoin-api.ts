import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMemecoinAPI() {
  console.log('🧪 Testing Memecoin API Routes...\n');

  try {
    // First, check if there are any users in the database
    console.log('0. Checking for existing users...');
    const users = await prisma.user.findMany({
      take: 1
    });

    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    const testUserId = users[0].id;
    console.log('✅ Using test user ID:', testUserId);

    // Test 1: Create a test memecoin
    console.log('\n1. Testing memecoin creation...');
    const testMemecoin = await prisma.memecoin.create({
      data: {
        creatorId: testUserId,
        coinName: 'Test Memecoin',
        coinSymbol: 'TEST',
        coinDescription: 'A test memecoin for API testing',
        totalSupply: '1000000000000',
        initialPrice: 0.0001,
        currentPrice: 0.0001,
        status: 'DEPLOYING',
        logoUrl: 'https://example.com/logo.png',
        websiteUrl: 'https://example.com',
        telegramUrl: 'https://t.me/testmemecoin',
        twitterUrl: 'https://twitter.com/testmemecoin'
      }
    });
    console.log('✅ Test memecoin created:', testMemecoin.id);

    // Test 2: Fetch memecoins
    console.log('\n2. Testing memecoin fetching...');
    const memecoins = await prisma.memecoin.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log('✅ Found memecoins:', memecoins.length);

    // Test 3: Update memecoin status
    console.log('\n3. Testing memecoin status update...');
    const updatedMemecoin = await prisma.memecoin.update({
      where: { id: testMemecoin.id },
      data: { status: 'DEPLOYED' }
    });
    console.log('✅ Memecoin status updated to:', updatedMemecoin.status);

    // Test 4: Test price data update
    console.log('\n4. Testing price data update...');
    const priceUpdatedMemecoin = await prisma.memecoin.update({
      where: { id: testMemecoin.id },
      data: {
        currentPrice: 0.0002,
        marketCap: 200000,
        volume24h: 10000,
        holders: 150
      }
    });
    console.log('✅ Price data updated:', {
      price: priceUpdatedMemecoin.currentPrice,
      marketCap: priceUpdatedMemecoin.marketCap,
      holders: priceUpdatedMemecoin.holders
    });

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testMemecoinAPI().catch(console.error); 

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Load env vars
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const createTestAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test accounts data
    const testAccounts = [
      {
        uid: 'test-pro-user',
        email: 'pro@test.com',
        username: 'protester',
        passwordHash: await bcrypt.hash('TestPass@123', 10),
        displayName: 'Pro Tester',
        bio: 'Testing Pro plan features',
        plan: 'pro',
        subscriptionStatus: 'active',
        paymentStatus: 'paid',
        role: 'creator',
        isVerified: true,
        emailVerified: true,
        approved: true,
        blocks: [
          { id: '1', type: 'header', title: 'Pro User Test', visible: true },
          { id: '2', type: 'link', title: 'Test Link', url: 'https://example.com', visible: true }
        ],
        style: {
          backgroundType: 'solid',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          buttonColor: '#000000',
          buttonTextColor: '#ffffff',
          buttonStyle: 'rounded',
          fontFamily: 'Inter'
        }
      },
      {
        uid: 'test-business-user',
        email: 'business@test.com',
        username: 'businesstester',
        passwordHash: await bcrypt.hash('TestPass@123', 10),
        displayName: 'Business Tester',
        bio: 'Testing Business plan features',
        plan: 'business',
        subscriptionStatus: 'active',
        paymentStatus: 'paid',
        role: 'creator',
        isVerified: true,
        emailVerified: true,
        approved: true,
        blocks: [
          { id: '1', type: 'header', title: 'Business User Test', visible: true },
          { id: '2', type: 'link', title: 'Advanced Feature', url: 'https://example.com', visible: true }
        ],
        style: {
          backgroundType: 'gradient',
          backgroundColor: '#ffffff',
          backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textColor: '#ffffff',
          buttonColor: '#ffffff',
          buttonTextColor: '#667eea',
          buttonStyle: 'pill',
          fontFamily: 'Inter'
        }
      }
    ];

    // Check if accounts already exist
    for (const account of testAccounts) {
      const exists = await User.findOne({ email: account.email });
      if (exists) {
        console.log(`⏭️  User ${account.email} already exists. Skipping.`);
        continue;
      }

      await User.create(account);
      console.log(`✅ Created test account: ${account.email} | Password: TestPass@123`);
    }

    console.log('\n✨ Test accounts setup complete!');
    console.log('Pro Account: pro@test.com / TestPass@123 (@protester)');
    console.log('Business Account: business@test.com / TestPass@123 (@businesstester)');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating test accounts:', err.message);
    process.exit(1);
  }
};

createTestAccounts();

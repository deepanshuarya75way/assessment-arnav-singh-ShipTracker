require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

(async () => {
  const {
    MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD  } = process.env;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD){
      console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first')
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    const email=ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({email});

    if(existing){
      existing.role='admin';
      await existing.save();
      console.log('Promoted to admin');
    } else{
      await User.create({
        name:ADMIN_NAME || 'Admin',
        email,
        password:ADMIN_PASSWORD,
        role:'admin',
      });
      console.log('Created admin');
    }
    process.exit(0);
})();
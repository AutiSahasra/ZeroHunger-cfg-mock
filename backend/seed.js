const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Region = require('./models/Region');
const FoodRequest = require('./models/FoodRequest');
const VolunteerLocation = require('./models/VolunteerLocation');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('🔄 Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Region.deleteMany({}),
      FoodRequest.deleteMany({}),
      VolunteerLocation.deleteMany({})
    ]);

    console.log('🌱 Seeding Regions...');
    const region1 = await Region.create({
      city: 'Chennai',
      name: 'Chennai South (Guindy/Adyar/Velachery)',
      center: {
        type: 'Point',
        coordinates: [80.2207, 13.0105] // [lng, lat]
      },
      isActive: true
    });

    const region2 = await Region.create({
      city: 'Chennai',
      name: 'Chennai Central (T. Nagar/Mylapore)',
      center: {
        type: 'Point',
        coordinates: [80.2341, 13.0418]
      },
      isActive: true
    });

    const region3 = await Region.create({
      city: 'Chennai',
      name: 'Chennai North (Anna Nagar/Koyambedu)',
      center: {
        type: 'Point',
        coordinates: [80.2100, 13.0850]
      },
      isActive: true
    });

    console.log('🌱 Seeding Users...');
    const donor1 = await User.create({
      name: 'ITC Grand Chola Banquets',
      email: 'banquets@itcgrandchola.com',
      password: 'password123',
      role: 'DONOR',
      phone: '+91 98401 23456',
      region: region1._id,
      isActive: true
    });

    const donor2 = await User.create({
      name: 'Annapoorna Catering Hall',
      email: 'events@annapoornacatering.in',
      password: 'password123',
      role: 'DONOR',
      phone: '+91 98402 78901',
      region: region2._id,
      isActive: true
    });

    const volunteer1 = await User.create({
      name: 'Karthik Raja',
      email: 'karthik.raja@volunteer.org',
      password: 'password123',
      role: 'VOLUNTEER',
      phone: '+91 97908 11223',
      region: region1._id,
      isActive: true
    });

    const volunteer2 = await User.create({
      name: 'Ananya Swaminathan',
      email: 'ananya.s@volunteer.org',
      password: 'password123',
      role: 'VOLUNTEER',
      phone: '+91 94440 98765',
      region: region2._id,
      isActive: true
    });

    console.log('🌱 Seeding Volunteer Locations...');
    await VolunteerLocation.create({
      volunteer: volunteer1._id,
      location: {
        type: 'Point',
        coordinates: [80.2250, 13.0200]
      },
      lastUpdated: new Date()
    });

    await VolunteerLocation.create({
      volunteer: volunteer2._id,
      location: {
        type: 'Point',
        coordinates: [80.2400, 13.0380]
      },
      lastUpdated: new Date()
    });

    console.log('🌱 Seeding Food Requests...');
    await FoodRequest.create([
      {
        donor: donor1._id,
        foodDetails: {
          foodType: '55 Meals — Hyderabadi Veg Dum Biryani & Cucumber Raitha',
          description: 'Untouched Surplus from Corporate Seminar, packed in 2 thermal containers'
        },
        quantity: 55,
        pickupLocation: {
          address: 'Loading Bay 3, ITC Grand Chola, Guindy, Chennai',
          coordinates: {
            type: 'Point',
            coordinates: [80.2207, 13.0105]
          }
        },
        region: region1._id,
        status: 'PENDING',
        priority: 85
      },
      {
        donor: donor2._id,
        foodDetails: {
          foodType: '35 Portions — South Indian Sambar, Poriyal & Rice',
          description: 'Freshly packed in sanitary steel cans, ready for pickup'
        },
        quantity: 35,
        pickupLocation: {
          address: 'Annapoorna Kitchen, Pondy Bazaar, T. Nagar, Chennai',
          coordinates: {
            type: 'Point',
            coordinates: [80.2341, 13.0418]
          }
        },
        region: region2._id,
        status: 'PENDING',
        priority: 65
      },
      {
        donor: donor1._id,
        foodDetails: {
          foodType: '60 Portions — Fresh Curd Rice & Lemon Rice Packs',
          description: 'Packaged into eco-friendly bio-degradable meal boxes'
        },
        quantity: 60,
        pickupLocation: {
          address: 'Adyar Gate banquet service entrance, Chennai',
          coordinates: {
            type: 'Point',
            coordinates: [80.2450, 13.0180]
          }
        },
        region: region1._id,
        status: 'PENDING',
        priority: 78
      }
    ]);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();

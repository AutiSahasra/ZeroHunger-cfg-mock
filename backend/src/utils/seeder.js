const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const FoodRequest = require('../models/FoodRequest');
const Notification = require('../models/Notification');

dotenv.config();

const SEED_DONORS = [
  {
    name: 'ITC Grand Chola Banquets',
    contactPerson: 'Chef Rajesh Sharma',
    phone: '+91 98401 23456',
    email: 'banquets@itcgrandchola.com',
    password: 'Password@123',
    role: 'DONOR',
    cityId: 'chennai',
    regionId: 'reg-chn-1',
    address: '63 Mount Road, Guindy, Chennai',
    lat: 13.0105,
    lng: 80.2207,
    status: 'ACTIVE'
  },
  {
    name: 'Annapoorna Catering Hall',
    contactPerson: 'Venkatesh Rao',
    phone: '+91 98402 78901',
    email: 'events@annapoornacatering.in',
    password: 'Password@123',
    role: 'DONOR',
    cityId: 'chennai',
    regionId: 'reg-chn-2',
    address: 'Pondy Bazaar, T. Nagar, Chennai',
    lat: 13.0418,
    lng: 80.2341,
    status: 'ACTIVE'
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zerohunger';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({ role: 'DONOR' });
    await FoodRequest.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seeder] Cleared previous donor collections.');

    // Seed Donors
    const createdDonors = [];
    for (const donor of SEED_DONORS) {
      const u = await User.create(donor);
      createdDonors.push(u);
    }
    console.log(`[Seeder] Seeded ${createdDonors.length} donors.`);

    const donor1 = createdDonors[0];
    const donor2 = createdDonors[1];

    // Seed Initial Requests for Donors
    const sampleRequests = [
      {
        title: '55 Meals — Hyderabadi Veg Dum Biryani & Cucumber Raitha',
        foodType: 'Vegetarian Meals (Untouched Surplus from Corporate Seminar)',
        category: 'Cooked Hot Meals',
        dietary: 'Vegetarian',
        servings: 55,
        quantityKg: 24,
        donorId: donor1._id,
        donorName: donor1.name,
        donorPhone: donor1.phone,
        pickupAddress: 'Loading Bay 3, ITC Grand Chola, Guindy, Chennai',
        pickupLat: 13.0105,
        pickupLng: 80.2207,
        cityId: 'chennai',
        regionId: 'reg-chn-1',
        cookedTime: '2 hours ago',
        goldenHourExpiresInHours: 2.5,
        instructions: 'Packed in 2 large food-grade thermal containers. Staff at gate will assist with loading.',
        photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
        status: 'PENDING',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 3600000),
            actor: donor1.name,
            reason: 'Surplus food request initiated'
          }
        ]
      },
      {
        title: '35 Portions — South Indian Sambar, Poriyal & Rice',
        foodType: 'Traditional South Indian Lunch',
        category: 'Cooked Meals',
        dietary: 'Vegetarian',
        servings: 35,
        quantityKg: 16,
        donorId: donor2._id,
        donorName: donor2.name,
        donorPhone: donor2.phone,
        pickupAddress: 'Annapoorna Kitchen, Pondy Bazaar, T. Nagar, Chennai',
        pickupLat: 13.0418,
        pickupLng: 80.2341,
        cityId: 'chennai',
        regionId: 'reg-chn-2',
        cookedTime: '2.5 hours ago',
        goldenHourExpiresInHours: 2.0,
        instructions: 'Freshly packed in sanitary steel cans, ready to hand off immediately.',
        photoUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop&q=60',
        status: 'ACCEPTED',
        assignedVolunteerName: 'Karthik Raja',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 7200000),
            actor: donor2.name,
            reason: 'Surplus food registered'
          },
          {
            status: 'ACCEPTED',
            timestamp: new Date(Date.now() - 1800000),
            actor: 'Karthik Raja (Volunteer)',
            reason: 'Assigned and volunteer en route to pickup'
          }
        ]
      },
      {
        title: '85 Chapatis, Dal Makhani & Paneer Subzi',
        foodType: 'North Indian Wedding Dinner Surplus',
        category: 'Cooked Hot Meals',
        dietary: 'Vegetarian',
        servings: 45,
        quantityKg: 22,
        donorId: donor2._id,
        donorName: donor2.name,
        donorPhone: donor2.phone,
        pickupAddress: 'Anna Nagar West Banquet Hall, Chennai',
        pickupLat: 13.0850,
        pickupLng: 80.2100,
        cityId: 'chennai',
        regionId: 'reg-chn-3',
        cookedTime: '5 hours ago',
        goldenHourExpiresInHours: 0,
        instructions: 'Transferred directly to Saidapet Bridge Homeless Shelter.',
        photoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60',
        status: 'DELIVERED',
        assignedVolunteerName: 'Karthik Raja',
        deliveredAt: new Date(Date.now() - 7200000),
        deliveryProof: {
          deliverySpotName: 'Saidapet Bridge Night Shelter & Relief Center',
          deliveryLat: 13.0210,
          deliveryLng: 80.2230,
          beneficiariesFed: 45,
          deliveryTimestamp: new Date(Date.now() - 7200000),
          foodPhotoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60',
          spotPhotoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
          volunteerNotes: 'Food arrived piping hot and was served immediately to 45 daily wage families.'
        },
        statusHistory: [
          { status: 'PENDING', timestamp: new Date(Date.now() - 18000000), actor: donor2.name, reason: 'Request placed' },
          { status: 'ACCEPTED', timestamp: new Date(Date.now() - 14400000), actor: 'Karthik Raja', reason: 'Claimed by volunteer' },
          { status: 'DELIVERED', timestamp: new Date(Date.now() - 7200000), actor: 'Karthik Raja', reason: 'Successfully distributed' }
        ]
      }
    ];

    await FoodRequest.insertMany(sampleRequests);
    console.log(`[Seeder] Seeded ${sampleRequests.length} food requests.`);

    console.log('[Seeder] Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder Error]:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;

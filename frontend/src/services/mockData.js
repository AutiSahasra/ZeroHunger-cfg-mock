// Initial Seed Data for No Food Waste Platform
// Covering Chennai, Coimbatore, Hyderabad with realistic coordinates and records

export const INITIAL_CITIES = [
  { id: 'chennai', name: 'Chennai', lat: 13.0827, lng: 80.2707, active: true },
  { id: 'coimbatore', name: 'Coimbatore', lat: 11.0168, lng: 76.9558, active: true },
  { id: 'hyderabad', name: 'Hyderabad', lat: 17.3850, lng: 78.4867, active: true }
];

export const INITIAL_REGIONS = [
  { id: 'reg-chn-1', cityId: 'chennai', name: 'Chennai South (Guindy/Adyar/Velachery)', active: true },
  { id: 'reg-chn-2', cityId: 'chennai', name: 'Chennai Central (T. Nagar/Mylapore)', active: true },
  { id: 'reg-chn-3', cityId: 'chennai', name: 'Chennai North (Anna Nagar/Koyambedu)', active: true },
  { id: 'reg-cbe-1', cityId: 'coimbatore', name: 'RS Puram & Gandhipuram', active: true },
  { id: 'reg-hyd-1', cityId: 'hyderabad', name: 'Hitec City & Gachibowli', active: true }
];

export const INITIAL_USERS = [
  {
    id: 'donor-1',
    name: 'ITC Grand Chola Banquets',
    contactPerson: 'Chef Rajesh Sharma',
    phone: '+91 98401 23456',
    email: 'banquets@itcgrandchola.com',
    role: 'DONOR',
    cityId: 'chennai',
    regionId: 'reg-chn-1',
    address: '63 Mount Road, Guindy, Chennai',
    lat: 13.0105,
    lng: 80.2207,
    status: 'ACTIVE'
  },
  {
    id: 'donor-2',
    name: 'Annapoorna Catering Hall',
    contactPerson: 'Venkatesh Rao',
    phone: '+91 98402 78901',
    email: 'events@annapoornacatering.in',
    role: 'DONOR',
    cityId: 'chennai',
    regionId: 'reg-chn-2',
    address: 'Pondy Bazaar, T. Nagar, Chennai',
    lat: 13.0418,
    lng: 80.2341,
    status: 'ACTIVE'
  },
  {
    id: 'vol-1',
    name: 'Karthik Raja',
    phone: '+91 97908 11223',
    email: 'karthik.raja@volunteer.org',
    role: 'VOLUNTEER',
    cityId: 'chennai',
    regionId: 'reg-chn-1',
    vehicleType: 'Car / Small Van (Eeco)',
    capacityKg: 80,
    status: 'ACTIVE',
    deliveriesCompleted: 44,
    foodDeliveredKg: 920,
    rating: 4.9,
    currentLat: 13.0200,
    currentLng: 80.2250,
    lastActive: 'Just now'
  },
  {
    id: 'vol-2',
    name: 'Ananya Swaminathan',
    phone: '+91 94440 98765',
    email: 'ananya.s@volunteer.org',
    role: 'VOLUNTEER',
    cityId: 'chennai',
    regionId: 'reg-chn-2',
    vehicleType: 'Two Wheeler (with insulated box)',
    capacityKg: 30,
    status: 'ACTIVE',
    deliveriesCompleted: 26,
    foodDeliveredKg: 460,
    rating: 4.8,
    currentLat: 13.0380,
    currentLng: 80.2400,
    lastActive: '10m ago'
  },
  {
    id: 'vol-3',
    name: 'Vignesh P',
    phone: '+91 98842 55432',
    email: 'vignesh.p@gmail.com',
    role: 'VOLUNTEER',
    cityId: 'chennai',
    regionId: 'reg-chn-3',
    vehicleType: 'Car',
    capacityKg: 60,
    status: 'PENDING_APPROVAL',
    deliveriesCompleted: 0,
    foodDeliveredKg: 0,
    rating: 5.0,
    currentLat: 13.0800,
    currentLng: 80.2100,
    lastActive: '1h ago'
  },
  {
    id: 'admin-1',
    name: 'Meera Ramanathan',
    phone: '+91 98410 00001',
    email: 'meera.operations@nofoodwaste.org',
    role: 'ADMIN',
    cityId: 'chennai',
    regionId: 'reg-chn-1',
    title: 'State Operations Director',
    status: 'ACTIVE'
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'req-101',
    title: '55 Meals — Hyderabadi Veg Dum Biryani & Cucumber Raitha',
    foodType: 'Vegetarian Meals (Untouched Surplus from Corporate Seminar)',
    category: 'Cooked Hot Meals',
    dietary: 'Vegetarian',
    servings: 55,
    quantityKg: 24,
    donorId: 'donor-1',
    donorName: 'ITC Grand Chola Banquets',
    donorPhone: '+91 98401 23456',
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
    assignedVolunteerId: null,
    assignedVolunteerName: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toISOString(), actor: 'ITC Grand Chola Banquets', reason: 'Surplus food request initiated' }
    ]
  },
  {
    id: 'req-102',
    title: '35 Portions — South Indian Sambar, Poriyal & Rice',
    foodType: 'Traditional South Indian Lunch',
    category: 'Cooked Meals',
    dietary: 'Vegetarian',
    servings: 35,
    quantityKg: 16,
    donorId: 'donor-2',
    donorName: 'Annapoorna Catering Hall',
    donorPhone: '+91 98402 78901',
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
    assignedVolunteerId: 'vol-1',
    assignedVolunteerName: 'Karthik Raja',
    assignedAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'Annapoorna Catering Hall', reason: 'Surplus food registered' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Karthik Raja (Volunteer)', reason: 'Assigned and volunteer en route to pickup' }
    ]
  },
  {
    id: 'req-103',
    title: '60 Portions — Fresh Curd Rice & Lemon Rice Packs',
    foodType: 'Individual Packets with Pickle',
    category: 'Packed Food',
    dietary: 'Vegetarian',
    servings: 60,
    quantityKg: 20,
    donorId: 'donor-1',
    donorName: 'ITC Grand Chola Banquets',
    donorPhone: '+91 98401 23456',
    pickupAddress: 'Adyar Gate banquet service entrance, Chennai',
    pickupLat: 13.0180,
    pickupLng: 80.2450,
    cityId: 'chennai',
    regionId: 'reg-chn-1',
    cookedTime: '3 hours ago',
    goldenHourExpiresInHours: 1.5,
    instructions: 'Already packaged into eco-friendly bio-degradable meal boxes.',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
    status: 'IN_PROGRESS',
    assignedVolunteerId: 'vol-2',
    assignedVolunteerName: 'Ananya Swaminathan',
    createdAt: new Date(Date.now() - 9000000).toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 9000000).toISOString(), actor: 'ITC Grand Chola Banquets', reason: 'Donation created' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 5400000).toISOString(), actor: 'Ananya Swaminathan', reason: 'Claimed by volunteer' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 1800000).toISOString(), actor: 'Ananya Swaminathan', reason: 'Food picked up, navigating to distribution shelter' }
    ]
  },
  {
    id: 'req-104',
    title: '85 Chapatis, Dal Makhani & Paneer Subzi',
    foodType: 'North Indian Wedding Dinner Surplus',
    category: 'Cooked Hot Meals',
    dietary: 'Vegetarian',
    servings: 45,
    quantityKg: 22,
    donorId: 'donor-2',
    donorName: 'Annapoorna Catering Hall',
    donorPhone: '+91 98402 78901',
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
    assignedVolunteerId: 'vol-1',
    assignedVolunteerName: 'Karthik Raja',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    deliveredAt: new Date(Date.now() - 7200000).toISOString(),
    deliveryProof: {
      deliverySpotName: 'Saidapet Bridge Night Shelter & Relief Center',
      deliveryLat: 13.0210,
      deliveryLng: 80.2230,
      beneficiariesFed: 45,
      deliveryTimestamp: new Date(Date.now() - 7200000).toISOString(),
      foodPhotoUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=60',
      spotPhotoUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=500&auto=format&fit=crop&q=60',
      volunteerNotes: 'Food arrived piping hot and was served immediately to 45 daily wage families.'
    },
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 18000000).toISOString(), actor: 'Annapoorna Catering Hall', reason: 'Request placed' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 14400000).toISOString(), actor: 'Karthik Raja', reason: 'Claimed by volunteer' },
      { status: 'IN_PROGRESS', timestamp: new Date(Date.now() - 10800000).toISOString(), actor: 'Karthik Raja', reason: 'Collected from kitchen' },
      { status: 'DELIVERED', timestamp: new Date(Date.now() - 7200000).toISOString(), actor: 'Karthik Raja', reason: 'Successfully distributed and proof uploaded' }
    ]
  }
];

export const INITIAL_HOTSPOTS = [
  {
    id: 'hotspot-1',
    name: 'Koyambedu Wholesale Market Migrant Shelter',
    cityId: 'chennai',
    lat: 13.0694,
    lng: 80.1948,
    deliveriesCount: 46,
    totalMealsReceived: 2650,
    urgencyLevel: 'HIGH',
    description: 'High concentration of daily load workers and migratory laborers without cooking facilities.',
    lastDelivery: 'Today, 2 hours ago'
  },
  {
    id: 'hotspot-2',
    name: 'Vyasarpadi Slum Board & Night Shelter',
    cityId: 'chennai',
    lat: 13.1182,
    lng: 80.2584,
    deliveriesCount: 39,
    totalMealsReceived: 2120,
    urgencyLevel: 'HIGH',
    description: 'Under-resourced neighborhood with over 120 senior citizens and destitute individuals.',
    lastDelivery: 'Yesterday'
  },
  {
    id: 'hotspot-3',
    name: 'Saidapet Bridge Homeless Camp',
    cityId: 'chennai',
    lat: 13.0210,
    lng: 80.2230,
    deliveriesCount: 34,
    totalMealsReceived: 1840,
    urgencyLevel: 'MEDIUM',
    description: 'Temporary shelter site near Adyar riverbank, regular food rescue dropoff point.',
    lastDelivery: 'Today, 1 hour ago'
  },
  {
    id: 'hotspot-4',
    name: 'Velachery Canal Relief Settlement',
    cityId: 'chennai',
    lat: 12.9759,
    lng: 80.2212,
    deliveriesCount: 28,
    totalMealsReceived: 1490,
    urgencyLevel: 'MEDIUM',
    description: 'Displaced community shelter prone to water stagnation, heavily reliant on NGO deliveries.',
    lastDelivery: '2 days ago'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    requestId: 'req-102',
    senderId: 'vol-1',
    senderName: 'Karthik Raja (Volunteer)',
    senderRole: 'VOLUNTEER',
    text: 'Hello Chef Venkatesh! I have claimed the request and am on my way with an insulated delivery crate. Will reach Pondy Bazaar in 15 minutes.',
    timestamp: new Date(Date.now() - 1500000).toISOString()
  },
  {
    id: 'msg-2',
    requestId: 'req-102',
    senderId: 'donor-2',
    senderName: 'Annapoorna Catering Hall',
    senderRole: 'DONOR',
    text: 'Thanks Karthik! Everything is sealed and warm. Please ring the kitchen bell at the back gate.',
    timestamp: new Date(Date.now() - 1200000).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    userId: 'donor-2',
    title: 'Volunteer Assigned!',
    message: 'Volunteer Karthik Raja has accepted your donation of 35 Meals (Sambar Rice).',
    requestId: 'req-102',
    type: 'ASSIGNMENT',
    read: false,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'admin-1',
    title: 'New Volunteer Awaiting Approval',
    message: 'Vignesh P has registered for the Chennai North region and needs credential verification.',
    type: 'ADMIN_ALERT',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'donor-2',
    title: 'Delivery Proof Verified',
    message: 'Your 85 Chapatis donation (req-104) has been successfully delivered to Saidapet Bridge Shelter!',
    requestId: 'req-104',
    type: 'DELIVERED',
    read: true,
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

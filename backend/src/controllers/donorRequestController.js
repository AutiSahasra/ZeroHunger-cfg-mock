const FoodRequest = require('../models/FoodRequest');
const RequestStatusHistory = require('../models/RequestStatusHistory');
const DeliveryProof = require('../models/DeliveryProof');
const Notification = require('../models/Notification');
const Region = require('../models/Region');
const VolunteerLocation = require('../models/VolunteerLocation');
const googleMapsService = require('../services/googleMapsService');

// @desc    Create a new surplus food donation request
// @route   POST /api/requests
// @access  Private (Donor only)
exports.createRequest = async (req, res, next) => {
  try {
    const {
      title,
      foodType,
      description,
      category,
      dietary,
      servings,
      quantity,
      quantityKg,
      pickupAddress,
      pickupLat,
      pickupLng,
      regionId,
      cookedTime,
      goldenHourExpiresInHours,
      instructions,
      photoUrl
    } = req.body;

    const foodTitle = title || foodType;
    const foodQuantity = Number(servings || quantity);

    if (!foodTitle || !foodQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Food title and servings/quantity are required.'
      });
    }

    const address = pickupAddress || req.user.address || 'Chennai';
    let lat = pickupLat !== undefined ? Number(pickupLat) : req.user.lat;
    let lng = pickupLng !== undefined ? Number(pickupLng) : req.user.lng;

    // Use Google Maps Geocoding service to verify or extract coordinates if needed
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      const geocoded = await googleMapsService.geocodeAddress(address);
      lat = geocoded.lat;
      lng = geocoded.lng;
    }

    // Lookup matching region by coordinates or user's assigned region
    let matchedRegion = regionId || req.user.region;
    if (!matchedRegion) {
      const regionDoc = await Region.findOne({ isActive: true });
      if (regionDoc) matchedRegion = regionDoc._id;
    }

    const calculatedQtyKg = quantityKg
      ? Number(quantityKg)
      : Math.max(1, Math.round(foodQuantity * 0.4));

    // Create Food Request in the foodrequests collection
    const newRequest = await FoodRequest.create({
      donor: req.user._id,
      foodDetails: {
        foodType: foodTitle,
        description: description || instructions || 'Fresh surplus food prepared hygienically',
        category: category || 'Cooked Hot Meals',
        dietary: dietary || 'Vegetarian',
        instructions: instructions || '',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60',
        cookedTime: cookedTime || 'Freshly prepared',
        goldenHourExpiresInHours: goldenHourExpiresInHours ? Number(goldenHourExpiresInHours) : 3.0
      },
      quantity: foodQuantity,
      quantityKg: calculatedQtyKg,
      pickupLocation: {
        address,
        coordinates: {
          type: 'Point',
          coordinates: [lng, lat] // GeoJSON order: [longitude, latitude]
        }
      },
      region: matchedRegion,
      status: 'PENDING',
      priority: Math.min(100, Math.max(10, Math.round(foodQuantity * 1.2)))
    });

    // Record initial status in requeststatushistories
    await RequestStatusHistory.create({
      request: newRequest._id,
      oldStatus: 'NONE',
      newStatus: 'PENDING',
      actor: req.user._id,
      reason: 'Surplus food rescue request created by donor'
    });

    // Add broadcast notification to notifications collection
    await Notification.create({
      recipient: null,
      type: 'NEW_REQUEST',
      message: `${newRequest.quantity} servings available at ${newRequest.pickupLocation.address}.`,
      request: newRequest._id,
      isRead: false
    });

    // Populate donor and region
    const populated = await FoodRequest.findById(newRequest._id)
      .populate('donor', 'name email phone address')
      .populate('region', 'name city');

    res.status(201).json({
      success: true,
      message: 'Surplus food request posted successfully.',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests created by the authenticated donor
// @route   GET /api/requests/mine
// @access  Private (Donor only)
exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = { donor: req.user._id };

    if (status) {
      if (status === 'ACTIVE') {
        query.status = { $in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] };
      } else if (status === 'COMPLETED') {
        query.status = 'DELIVERED';
      } else {
        query.status = status.toUpperCase();
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await FoodRequest.find(query)
      .populate('assignedVolunteer', 'name phone email vehicleType')
      .populate('region', 'name city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await FoodRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request details by ID
// @route   GET /api/requests/:id
// @access  Private (Donor only)
exports.getRequestById = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('assignedVolunteer', 'name phone email')
      .populate('region', 'name city center');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found.'
      });
    }

    // Verify ownership
    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this food donation request.'
      });
    }

    // Fetch related delivery proof if delivered
    const deliveryProof = await DeliveryProof.findOne({ request: request._id });

    // Fetch full audit status history
    const statusHistory = await RequestStatusHistory.find({ request: request._id })
      .populate('actor', 'name role')
      .sort({ createdAt: 1 });

    const responseData = request.toObject();
    responseData.deliveryProof = deliveryProof;
    responseData.statusHistory = statusHistory;

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update request details (allowed ONLY when status is PENDING)
// @route   PATCH /api/requests/:id
// @access  Private (Donor only)
exports.updateRequest = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found.'
      });
    }

    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this request.'
      });
    }

    // Enforce TRD Section 6 & 11 state constraint
    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit request with status '${request.status}'. Edits are only permitted while status is PENDING.`
      });
    }

    const {
      title,
      foodType,
      description,
      category,
      dietary,
      servings,
      quantity,
      quantityKg,
      pickupAddress,
      pickupLat,
      pickupLng,
      instructions,
      goldenHourExpiresInHours,
      photoUrl
    } = req.body;

    if (title || foodType) {
      request.foodDetails.foodType = title || foodType;
    }
    if (description !== undefined) request.foodDetails.description = description;
    if (category) request.foodDetails.category = category;
    if (dietary) request.foodDetails.dietary = dietary;
    if (instructions !== undefined) request.foodDetails.instructions = instructions;
    if (goldenHourExpiresInHours !== undefined) {
      request.foodDetails.goldenHourExpiresInHours = Number(goldenHourExpiresInHours);
    }
    if (photoUrl) request.foodDetails.photoUrl = photoUrl;

    if (servings || quantity) {
      request.quantity = Number(servings || quantity);
      request.quantityKg = quantityKg
        ? Number(quantityKg)
        : Math.max(1, Math.round(request.quantity * 0.4));
    }

    if (pickupAddress) {
      request.pickupLocation.address = pickupAddress;
    }
    if (pickupLat !== undefined && pickupLng !== undefined) {
      request.pickupLocation.coordinates = {
        type: 'Point',
        coordinates: [Number(pickupLng), Number(pickupLat)]
      };
    }

    await request.save();

    // Log update in requeststatushistories
    await RequestStatusHistory.create({
      request: request._id,
      oldStatus: 'PENDING',
      newStatus: 'PENDING',
      actor: req.user._id,
      reason: 'Donor updated food request details'
    });

    res.status(200).json({
      success: true,
      message: 'Donation request updated successfully.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel request (allowed ONLY when status is PENDING)
// @route   DELETE /api/requests/:id or POST /api/requests/:id/cancel
// @access  Private (Donor only)
exports.cancelRequest = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found.'
      });
    }

    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this request.'
      });
    }

    // Enforce TRD Section 6 & 11 state constraint
    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel request with status '${request.status}'. Cancellations are only permitted before a volunteer claims the request.`
      });
    }

    const reason = req.body.reason || 'Cancelled by donor';

    request.status = 'CANCELLED';
    await request.save();

    // Log cancellation in requeststatushistories
    await RequestStatusHistory.create({
      request: request._id,
      oldStatus: 'PENDING',
      newStatus: 'CANCELLED',
      actor: req.user._id,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Donation request cancelled successfully.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live volunteer tracking details for an assigned request
// @route   GET /api/requests/:id/tracking
// @access  Private (Donor only)
exports.getVolunteerTracking = async (req, res, next) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate('donor', 'name email phone address')
      .populate('assignedVolunteer', 'name phone email vehicleType')
      .populate('region', 'name city center');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Food request not found.'
      });
    }

    const requestDonorId = request.donor?._id || request.donor;
    if (requestDonorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this tracking stream.'
      });
    }

    if (!request.assignedVolunteer) {
      return res.status(200).json({
        success: true,
        isAssigned: false,
        message: 'No volunteer assigned yet. Request is pending rescue.',
        request: {
          id: request._id,
          title: request.foodDetails?.foodType,
          status: request.status,
          pickupAddress: request.pickupLocation?.address,
          pickupLocation: {
            lat: request.pickupLat,
            lng: request.pickupLng
          }
        }
      });
    }

    const volunteerId = request.assignedVolunteer._id;
    let volLocation = await VolunteerLocation.findOne({ volunteer: volunteerId });

    // Fallback if volunteer location record is not initialized yet
    let volLat = 13.0450;
    let volLng = 80.2350;
    let lastUpdated = new Date();

    if (volLocation && volLocation.location && volLocation.location.coordinates) {
      volLng = volLocation.location.coordinates[0];
      volLat = volLocation.location.coordinates[1];
      lastUpdated = volLocation.lastUpdated || volLocation.updatedAt;
    } else {
      // Offset slightly from pickup to simulate realistic arrival
      volLat = (request.pickupLat || 13.0400) + 0.015;
      volLng = (request.pickupLng || 80.2300) + 0.012;
    }

    const pickupLat = request.pickupLat || 13.0418;
    const pickupLng = request.pickupLng || 80.2341;

    // Use Google Maps Directions API to calculate real-time driving route & ETA
    const directions = await googleMapsService.getDirections(
      volLat,
      volLng,
      pickupLat,
      pickupLng
    );

    res.status(200).json({
      success: true,
      isAssigned: true,
      request: {
        id: request._id,
        title: request.foodDetails?.foodType,
        status: request.status,
        quantity: request.quantity,
        pickupAddress: request.pickupLocation?.address,
        pickupCoordinates: {
          lat: pickupLat,
          lng: pickupLng
        }
      },
      volunteer: {
        id: request.assignedVolunteer._id,
        name: request.assignedVolunteer.name,
        phone: request.assignedVolunteer.phone,
        vehicleType: request.assignedVolunteer.vehicleType || 'Standard Vehicle'
      },
      volunteerLocation: {
        lat: volLat,
        lng: volLng,
        lastUpdated
      },
      route: {
        distanceKm: directions.distanceKm,
        distanceText: directions.distanceText || `${directions.distanceKm} km`,
        durationMinutes: directions.durationMinutes || 12,
        durationText: directions.durationText || '12 mins',
        overviewPolyline: directions.overviewPolyline,
        routePoints: directions.routePoints || [
          { lat: volLat, lng: volLng },
          { lat: pickupLat, lng: pickupLng }
        ],
        steps: directions.steps || []
      },
      googleMapsApiKey: googleMapsService.getApiKey()
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking data for all active requests of the authenticated donor
// @route   GET /api/donors/me/active-tracking
// @access  Private (Donor only)
exports.getActiveMissionsTracking = async (req, res, next) => {
  try {
    const activeRequests = await FoodRequest.find({
      donor: req.user._id,
      status: { $in: ['ACCEPTED', 'IN_PROGRESS'] },
      assignedVolunteer: { $ne: null }
    }).populate('assignedVolunteer', 'name phone vehicleType');

    const trackingList = [];

    for (const reqDoc of activeRequests) {
      const volId = reqDoc.assignedVolunteer._id;
      let volLocation = await VolunteerLocation.findOne({ volunteer: volId });

      let volLat = 13.0450;
      let volLng = 80.2350;
      let lastUpdated = new Date();

      if (volLocation && volLocation.location && volLocation.location.coordinates) {
        volLng = volLocation.location.coordinates[0];
        volLat = volLocation.location.coordinates[1];
        lastUpdated = volLocation.lastUpdated || volLocation.updatedAt;
      } else {
        volLat = (reqDoc.pickupLat || 13.0400) + 0.012;
        volLng = (reqDoc.pickupLng || 80.2300) + 0.010;
      }

      const pickupLat = reqDoc.pickupLat || 13.0418;
      const pickupLng = reqDoc.pickupLng || 80.2341;

      const directions = await googleMapsService.getDirections(
        volLat,
        volLng,
        pickupLat,
        pickupLng
      );

      trackingList.push({
        requestId: reqDoc._id,
        requestTitle: reqDoc.foodDetails?.foodType,
        status: reqDoc.status,
        servings: reqDoc.quantity,
        pickupAddress: reqDoc.pickupLocation?.address,
        pickupLocation: { lat: pickupLat, lng: pickupLng },
        volunteer: {
          id: reqDoc.assignedVolunteer._id,
          name: reqDoc.assignedVolunteer.name,
          phone: reqDoc.assignedVolunteer.phone,
          vehicleType: reqDoc.assignedVolunteer.vehicleType || 'Vehicle'
        },
        volunteerLocation: { lat: volLat, lng: volLng, lastUpdated },
        tracking: {
          distanceKm: directions.distanceKm,
          distanceText: directions.distanceText || `${directions.distanceKm} km`,
          durationText: directions.durationText || '10 mins',
          overviewPolyline: directions.overviewPolyline,
          routePoints: directions.routePoints
        }
      });
    }

    res.status(200).json({
      success: true,
      count: trackingList.length,
      data: trackingList,
      googleMapsApiKey: googleMapsService.getApiKey()
    });
  } catch (error) {
    next(error);
  }
};

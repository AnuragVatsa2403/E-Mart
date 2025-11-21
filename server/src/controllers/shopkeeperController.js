// /server/src/controllers/shopkeeperController.js
import User from "../models/User.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * GET /api/shopkeepers/near?lat=<lat>&lng=<lng>&radiusKm=3
 * Uses $geoNear to return nearby shopkeepers and attach their products.
 */
export const getNearbyShopkeepers = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radiusKm) || 3;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid lat/lng" });
    }

    // maxDistance for $geoNear is in meters
    const maxDistanceMeters = radiusKm * 1000;

    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: maxDistanceMeters,
          query: { role: "shopkeeper", location: { $ne: null } },
        },
      },
      {
        $addFields: {
          distanceKm: { $divide: ["$distanceMeters", 1000] },
        },
      },
      {
        $project: {
          password: 0,
          // exclude sensitive fields
        },
      },
      {
        // optional lookup to attach products
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "createdBy",
          as: "products",
        },
      },
      {
        $limit: 200, // safety
      },
    ];

    const shopkeepers = await User.aggregate(pipeline);

    res.json({ count: shopkeepers.length, shopkeepers });
  } catch (error) {
    console.error("getNearbyShopkeepers error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/shopkeepers/:id/products
 * Returns products listed by a specific shopkeeper (with pagination).
 */
export const getShopkeeperProducts = async (req, res) => {
  try {
    const shopId = req.params.id;
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "50");
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: "Invalid shop id" });
    }

    const products = await Product.find({ createdBy: shopId }).skip(skip).limit(limit).lean();
    const total = await Product.countDocuments({ createdBy: shopId });

    res.json({ count: products.length, total, page, products });
  } catch (error) {
    console.error("getShopkeeperProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};

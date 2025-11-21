import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

//add products 
//get all products
//get one product by ID
//update product detail
//Delete product 


export const addProduct= async (req,res)=>{
    try {
        const {name, description, category, price, offerPrice}= req.body;

        const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];


        const product= await Product.create({
            name,
            description,
            category,
            price,
            offerPrice,
            images,
            createdBy: req.user._id,
        });

        res.status(201).json({message:"Prodect added",product})
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};




export const getProducts= async (req,res)=>{
    try {
        const products= await Product.find().populate("createdBy","username email")
        res.json(products)
    } catch (error) {
        res.status(500).json({message:error.message});
    }
};




export const getProductId= async (req,res)=>{
    try {
        const product= await Product.findById(req.params.id);
        if(!product)
            return res.status(404).json({message:"Product not found"})
        res.json(product);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
};



export const getMyProducts = async (req, res) => {
  try {
    const shopkeeperId = req.user._id;
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(200, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : "";

    const filter = { createdBy: shopkeeperId };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({ success: true, products, total, page, limit });
  } catch (error) {
    console.error("getMyProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};





export const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({
      category: { $regex: req.params.categoryName, $options: "i" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorised" });
    }

    // Delete image files from uploads folder
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgPath) => {
        try {
          const fullPath = path.join(process.cwd(), imgPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.log("⚠ Image delete error:", err.message);
        }
      });
    }

    await product.deleteOne();

    return res.json({
      success: true,
      message: "Product deleted successfully",
      id: req.params.id,
    });

  } catch (error) {
    console.error("❌ Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getOfferProducts = async (req, res) => {
  try {
    // ✅ Fetch products where offerPrice < price (meaning they’re on discount)
    const offers = await Product.find({
      $expr: { $lt: ["$offerPrice", "$price"] },
    }).populate("createdBy", "username email");

    res.json(offers);
  } catch (error) {
    console.error("Error fetching offer products:", error);
    res.status(500).json({ message: error.message });
  }
};


export const toggleStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id" });
    }

    // debug logs (remove in production)
    console.log("toggleStock called:", { productId: id, body: req.body, user: req.user?._id });

    // find the product that belongs to this shopkeeper
    const product = await Product.findOne({ _id: id, createdBy: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found or unauthorized" });
    }

    // Expect client to send boolean inStock (or convertable)
    const incoming = req.body.inStock;
    if (incoming === undefined) {
      return res.status(400).json({ success: false, message: "inStock field is required" });
    }

    const newInStock = incoming === "true" || incoming === true; // handle string/bool
    product.inStock = newInStock;
    await product.save();

    return res.json({ success: true, message: "Stock updated", product });
  } catch (error) {
    console.error("toggleStock error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOne({ _id: id, createdBy: req.user._id });

    if (!product) {
      return res.status(404).json({ message: "Product not found or unauthorized" });
    }

    // ----------------------------
    // 📌 1. Basic Fields Update
    // ----------------------------
    const { name, description, category, price, offerPrice, inStock } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price !== undefined) product.price = Number(price);
    if (offerPrice !== undefined) product.offerPrice = Number(offerPrice);
    if (inStock !== undefined) product.inStock = inStock === "true" || inStock === true;


    // ----------------------------
    // 📌 2. IMAGE UPDATE PROCESS
    // ----------------------------

    /** 
     * The frontend sends:
     *   existingImages: ["old1.jpg", "old2.jpg"]
     *   images (files) — both replacements + new
     *   imageActions: separate JSON { type: "replace", index, fileIndex }
     */

    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = JSON.parse(req.body.existingImages); // images kept after delete
    }

    // If no images provided from frontend, keep original
    if (!existingImages.length && product.images.length) {
      existingImages = product.images;
    }

    // Parse imageActions → tells backend which uploaded file replaces which old one
    let imageActions = [];
    if (req.body.imageActions) {
      // may receive multiple values → always parse
      if (Array.isArray(req.body.imageActions)) {
        imageActions = req.body.imageActions.map((a) => JSON.parse(a));
      } else {
        imageActions = [JSON.parse(req.body.imageActions)];
      }
    }

    // Uploaded files (multer)
    const uploadedFiles = req.files || [];

    let finalImages = [...existingImages];

    // ----------------------------
    // 📌 3. Process Replace Actions
    // ----------------------------
    let filePointer = 0;

    imageActions.forEach((action) => {
      if (action.type === "replace" && uploadedFiles[filePointer]) {
        const newPath = `/uploads/${uploadedFiles[filePointer].filename}`;
        finalImages[action.index] = newPath;
        filePointer++;
      }
    });

    // ----------------------------
    // 📌 4. Add NEW Images (not replacements)
    // ----------------------------
    while (filePointer < uploadedFiles.length) {
      const extraFile = uploadedFiles[filePointer];
      finalImages.push(`/uploads/${extraFile.filename}`);
      filePointer++;
    }

    product.images = finalImages;


    // ----------------------------
    // 📌 5. SAVE PRODUCT
    // ----------------------------
    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("❌ updateProduct error:", error);
    res.status(500).json({ message: error.message });
  }
};

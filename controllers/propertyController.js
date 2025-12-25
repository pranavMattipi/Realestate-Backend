import fs from "fs";
import path from "path";
import Property from "../models/Property.js";

/* =========================
   CREATE PROPERTY
========================= */
export const createProperty = async (req, res) => {
  try {
    const data = req.body;

    let images = [];

    // ✅ 1. Handle image URLs from Postman (raw JSON / form-data)
    if (data.images) {
      if (Array.isArray(data.images)) {
        images = data.images;
      } else if (typeof data.images === "string") {
        images = [data.images];
      }
    }

    // ✅ 2. Handle file uploads (multer)
    if (req.files && req.files.length > 0) {
      images = images.concat(
        req.files.map(f => `/uploads/${f.filename}`)
      );
    }

    const property = new Property({
      ...data,
      images,                                   // 🔥 FIXED
      owner: req.user ? req.user._id : null,
      price: Number(data.price),
    });

    await property.save();
    return res.status(201).json(property);
  } catch (err) {
    console.error("Create property error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* =========================
   GET ALL PROPERTIES
========================= */
export const getProperties = async (req, res) => {
  try {
    const filter = {};

    if (req.query.city) filter.city = req.query.city;
    if (req.query.type) filter.type = req.query.type;

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.minArea) {
      filter.area = { $gte: Number(req.query.minArea) };
    }

    const props = await Property.find(filter).sort({ createdAt: -1 });
    return res.json(props);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

/* =========================
   GET SINGLE PROPERTY
========================= */
export const getProperty = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ msg: "Property not found" });

    return res.json(prop);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

/* =========================
   UPDATE PROPERTY
========================= */
export const updateProperty = async (req, res) => {
  try {
    const data = req.body;
    let images = [];

    // URLs
    if (data.images) {
      if (Array.isArray(data.images)) {
        images = data.images;
      } else if (typeof data.images === "string") {
        try {
          images = JSON.parse(data.images);
        } catch {
          images = [data.images];
        }
      }
    }

    // Files
    if (req.files && req.files.length > 0) {
      images = images.concat(
        req.files.map(f => `/uploads/${f.filename}`)
      );
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        images,
        price: Number(data.price),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Property not found" });

    return res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* =========================
   DELETE PROPERTY
========================= */
export const deleteProperty = async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) return res.status(404).json({ msg: "Property not found" });

    if (Array.isArray(prop.images)) {
      for (const img of prop.images) {
        if (!img.startsWith("/uploads")) continue;
        const filePath = path.join(process.cwd(), img);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    return res.json({ msg: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

/* =========================
   GET MY PROPERTIES
========================= */
export const getMyProperties = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });

    const props = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    return res.json(props);
  } catch (err) {
    console.error("Get my properties error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

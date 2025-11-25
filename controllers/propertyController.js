import fs from "fs";
import path from "path";
import Property from "../models/Property.js";

// CREATE PROPERTY
export const createProperty = async (req, res) => {
  try {
    const data = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (data.images) {
      try {
        images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
      } catch (err) {
        images = [];
      }
    }

    const price = Number(data.price);

    // Parse ownerDetails correctly
    let owner = {};
    try {
      owner = typeof data.ownerDetails === "string"
        ? JSON.parse(data.ownerDetails)
        : data.ownerDetails || {};
    } catch (err) {
      owner = {};
    }

    const prop = new Property({
      ...data,
      images,
      price,
      ownerName: owner.name || data.ownerName,
      ownerPhone: owner.phone || data.ownerPhone,
      ownerEmail: owner.email || data.ownerEmail,
    });

    await prop.save();
    return res.json(prop);
  } catch (err) {
    console.error("Error creating property:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// GET ALL PROPERTIES
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
    if (req.query.minArea) filter.area = { $gte: Number(req.query.minArea) };

    const props = await Property.find(filter).sort({ createdAt: -1 });
    return res.json(props);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
};

// GET SINGLE PROPERTY
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

// UPDATE PROPERTY
export const updateProperty = async (req, res) => {
  try {
    const data = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => `/uploads/${f.filename}`);
    } else if (data.images) {
      try {
        images = typeof data.images === "string" ? JSON.parse(data.images) : data.images;
      } catch (err) {
        images = [];
      }
    }

    const price = Number(data.price);

    let owner = {};
    try {
      owner = typeof data.ownerDetails === "string"
        ? JSON.parse(data.ownerDetails)
        : data.ownerDetails || {};
    } catch {
      owner = {};
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        images,
        price,
        ownerName: owner.name || data.ownerName,
        ownerPhone: owner.phone || data.ownerPhone,
        ownerEmail: owner.email || data.ownerEmail,
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

// DELETE PROPERTY
export const deleteProperty = async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);

    if (!prop) return res.status(404).json({ msg: "Property not found" });

    try {
      if (Array.isArray(prop.images)) {
        for (const img of prop.images) {
          if (!img) continue;
          const clean = img.startsWith("/") ? img.slice(1) : img;
          const absolute = path.join(process.cwd(), clean);
          if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
        }
      }
    } catch (fsErr) {
      console.warn("Failed to remove images:", fsErr);
    }

    return res.json({ msg: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

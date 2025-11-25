import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  price: { type: Number, required: true },
  type: { type: String, enum: ["sale", "rent"], required: true },

  bedrooms: Number,
  bathrooms: Number,
  area: Number,

  furnishing: { type: String },  // furnished, semi-furnished, unfurnished
  propertyAge: { type: String }, // 0-1 yrs, 1-5 yrs, etc.
  parking: { type: String },     // yes/no/cars count
  floor: { type: String },       // "Ground", "5th Floor" etc.
  totalFloors: Number,

  address: String,
  city: String,
  state: String,
  pincode: String,

  images: [String],  // array of image URLs

  ownerName: String,
  ownerPhone: String,
  ownerEmail: String,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Property", PropertySchema);

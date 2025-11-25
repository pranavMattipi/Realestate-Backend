import express from "express";
import multer from "multer";
import path from "path";
import {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Routes
router.post("/", upload.array("images", 10), createProperty);
router.put("/:id", upload.array("images", 10), updateProperty); // update
router.delete("/:id", deleteProperty); // delete
router.get("/", getProperties);
router.get("/:id", getProperty);

export default router;

import express from "express";
import Cart from "../models/Cart.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

/* ADD TO CART */
router.post("/add", authMiddleware, async (req, res) => {
  const { propertyId } = req.body;
  const userId = req.user.id;

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const exists = cart.items.some(
    (i) => i.propertyId.toString() === propertyId
  );

  if (!exists) {
    cart.items.push({ propertyId });
    await cart.save();
  }

  res.json({ success: true });
});

/* GET CART */
router.get("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id })
    .populate("items.propertyId");

  if (!cart) return res.json([]);

  res.json(cart.items.map((i) => i.propertyId));
});

/* REMOVE ITEM */
router.delete("/remove/:id", authMiddleware, async (req, res) => {
  await Cart.updateOne(
    { userId: req.user.id },
    { $pull: { items: { propertyId: req.params.id } } }
  );

  res.json({ success: true });
});

/* CLEAR CART */
router.delete("/clear", authMiddleware, async (req, res) => {
  await Cart.deleteOne({ userId: req.user.id });
  res.json({ success: true });
});

export default router;

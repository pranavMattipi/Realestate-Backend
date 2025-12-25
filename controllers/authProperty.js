import Property from '../models/Property.js';
const prop = new Property({ ...data, images, owner: req.user.id, price: Number(data.price) });
await prop.save();
res.json(prop);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};


export const getProperties = async (req, res) => {
try {
const query = {};

if (req.query.type) query.type = req.query.type;
if (req.query.city) query.city = req.query.city;

// Rent filter
if (req.query.minPrice || req.query.maxPrice) {
query.price = {};
if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
}

// Bedrooms filter
if (req.query.bedrooms) {
if (String(req.query.bedrooms).includes("+")) {
// e.g. "4+ BHK"
query.bedrooms = { $gte: parseInt(req.query.bedrooms) };
} else {
query.bedrooms = parseInt(req.query.bedrooms);
}
}

// Bathrooms filter
if (req.query.bathrooms) {
if (String(req.query.bathrooms).includes("+")) {
query.bathrooms = { $gte: parseInt(req.query.bathrooms) };
} else {
query.bathrooms = parseInt(req.query.bathrooms);
}
}

// Parking filter (exact match)
if (req.query.parking) query.parking = req.query.parking;

// Furnishing filter (case-insensitive)
if (req.query.furnishing) query.furnishing = new RegExp(req.query.furnishing, "i");

// Property Age filter (exact match)
if (req.query.propertyAge) query.propertyAge = req.query.propertyAge;

const properties = await Property.find(query);
res.json(properties);
} catch (err) {
console.error(err);
res.status(500).json({ error: "Server error" });
}
};


export const getProperty = async (req, res) => {
try {
const prop = await Property.findById(req.params.id).populate('owner', 'name email');
if (!prop) return res.status(404).json({ msg: 'Property not found' });
res.json(prop);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};


export const updateProperty = async (req, res) => {
try {
const prop = await Property.findById(req.params.id);
if (!prop) return res.status(404).json({ msg: 'Property not found' });
if (prop.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });
const data = req.body;
if (req.files && req.files.length) {
const images = (req.files || []).map(f => `/uploads/${f.filename}`);
prop.images = prop.images.concat(images);
}
Object.assign(prop, data);
await prop.save();
res.json(prop);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};


export const deleteProperty = async (req, res) => {
try {
const prop = await Property.findById(req.params.id);
if (!prop) return res.status(404).json({ msg: 'Property not found' });
if (prop.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });
// delete images from uploads folder
prop.images.forEach(imgPath => {
const p = '.' + imgPath; // relative
if (fs.existsSync(p)) fs.unlinkSync(p);
});
await prop.remove();
res.json({ msg: 'Property removed' });
} catch (err) {
console.error(err);
res.status(500).send('Server error');
}
};
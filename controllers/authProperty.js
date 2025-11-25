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
const filter = {};
if (req.query.city) filter.city = req.query.city;
if (req.query.type) filter.type = req.query.type;
const props = await Property.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
res.json(props);
} catch (err) {
console.error(err);
res.status(500).send('Server error');
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
import { Router } from 'express';
import Password from '../models/Password.js';
import auth from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const router = Router();
router.use(auth);

// Get all passwords
router.get('/', async (req, res) => {
  try {
    const { search, category, favorite } = req.query;
    const filter = { user: req.userId };

    if (category && category !== 'all') filter.category = category;
    if (favorite === 'true') filter.favorite = true;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { website: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const passwords = await Password.find(filter).sort({ updatedAt: -1 });

    const decrypted = passwords.map((p) => ({
      id: p._id,
      title: p.title,
      website: p.website,
      username: p.username,
      password: decrypt(p.password),
      notes: p.notes ? decrypt(p.notes) : '',
      category: p.category,
      favorite: p.favorite,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json(decrypted);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single password
router.get('/:id', async (req, res) => {
  try {
    const password = await Password.findOne({ _id: req.params.id, user: req.userId });
    if (!password) return res.status(404).json({ message: 'Not found' });

    res.json({
      id: password._id,
      title: password.title,
      website: password.website,
      username: password.username,
      password: decrypt(password.password),
      notes: password.notes ? decrypt(password.notes) : '',
      category: password.category,
      favorite: password.favorite,
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create password
router.post('/', async (req, res) => {
  try {
    const { title, website, username, password, notes, category } = req.body;

    if (!title || !password) {
      return res.status(400).json({ message: 'Title and password are required' });
    }

    const entry = await Password.create({
      user: req.userId,
      title,
      website: website || '',
      username: username || '',
      password: encrypt(password),
      notes: notes ? encrypt(notes) : '',
      category: category || 'other',
    });

    res.status(201).json({
      id: entry._id,
      title: entry.title,
      website: entry.website,
      username: entry.username,
      password,
      notes: notes || '',
      category: entry.category,
      favorite: entry.favorite,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update password
router.put('/:id', async (req, res) => {
  try {
    const entry = await Password.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    const { title, website, username, password, notes, category, favorite } = req.body;

    if (title !== undefined) entry.title = title;
    if (website !== undefined) entry.website = website;
    if (username !== undefined) entry.username = username;
    if (password !== undefined) entry.password = encrypt(password);
    if (notes !== undefined) entry.notes = notes ? encrypt(notes) : '';
    if (category !== undefined) entry.category = category;
    if (favorite !== undefined) entry.favorite = favorite;

    await entry.save();

    res.json({
      id: entry._id,
      title: entry.title,
      website: entry.website,
      username: entry.username,
      password: password !== undefined ? password : decrypt(entry.password),
      notes: entry.notes ? decrypt(entry.notes) : '',
      category: entry.category,
      favorite: entry.favorite,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete password
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Password.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const entry = await Password.findOne({ _id: req.params.id, user: req.userId });
    if (!entry) return res.status(404).json({ message: 'Not found' });

    entry.favorite = !entry.favorite;
    await entry.save();

    res.json({ id: entry._id, favorite: entry.favorite });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

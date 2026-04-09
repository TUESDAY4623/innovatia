const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── MongoDB Connection (cached for serverless) ───
let cachedConnection = null;

async function connectDB() {
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        cachedConnection = await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        return cachedConnection;
    } catch (err) {
        console.error('❌ Could not connect to MongoDB:', err);
        cachedConnection = null;
        throw err;
    }
}

// Team Schema
const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    round1: { type: Number, default: null },
    round2: { type: Number, default: null },
    round3: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
});

// Virtual for total score
teamSchema.virtual('total').get(function () {
    return (this.round1 || 0) + (this.round2 || 0) + (this.round3 || 0);
});

// Ensure virtuals are included in JSON
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

// ─── Middleware: ensure DB is connected before API requests ──
app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// ─── Routes ────────────────────────────────────────

// Get all teams
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ createdAt: 1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single team
app.get('/api/teams/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new team
app.post('/api/teams', async (req, res) => {
    if (!req.body.name || !req.body.name.trim()) {
        return res.status(400).json({ message: 'Team name is required' });
    }

    const team = new Team({
        name: req.body.name.trim(),
        round1: req.body.round1 ?? null,
        round2: req.body.round2 ?? null,
        round3: req.body.round3 ?? null
    });

    try {
        const newTeam = await team.save();
        res.status(201).json(newTeam);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A team with this name already exists' });
        }
        res.status(400).json({ message: err.message });
    }
});

// Update marks for a team
app.patch('/api/teams/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });

        if (req.body.round1 !== undefined) team.round1 = req.body.round1;
        if (req.body.round2 !== undefined) team.round2 = req.body.round2;
        if (req.body.round3 !== undefined) team.round3 = req.body.round3;
        if (req.body.name !== undefined) team.name = req.body.name.trim();

        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A team with this name already exists' });
        }
        res.status(400).json({ message: err.message });
    }
});

// Delete a team
app.delete('/api/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.json({ message: 'Team deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Only listen locally (Vercel handles this in production)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless
module.exports = app;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Search = require('../models/Search');

// GET /search/suggestions - Autosuggest for search
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ cities: [], properties: [], sellers: [] });
        }

        const suggestions = await Search.getSuggestions(q);
        res.json(suggestions);
    } catch (error) {
        console.error('Error in autosuggest:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

// POST /saved-searches - Save a search
router.post('/saved-searches', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { name, filters } = req.body;

        if (!name || !filters) {
            return res.status(400).json({ error: 'Name and filters are required' });
        }

        const insertId = await Search.saveSearch(userId, name, filters);

        res.status(201).json({
            id: insertId,
            name,
            filters,
            created_at: new Date()
        });
    } catch (error) {
        console.error('Error saving search:', error);
        res.status(500).json({ error: 'Failed to save search' });
    }
});

// GET /saved-searches - Get user's saved searches
router.get('/saved-searches', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const savedSearches = await Search.getSavedSearches(userId);
        res.json({ savedSearches });
    } catch (error) {
        console.error('Error fetching saved searches:', error);
        res.status(500).json({ error: 'Failed to fetch saved searches' });
    }
});

// DELETE /saved-searches/:id - Delete a saved search
router.delete('/saved-searches/:id', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const searchId = req.params.id;

        const success = await Search.deleteSavedSearch(searchId, userId);

        if (!success) {
            return res.status(404).json({ error: 'Saved search not found' });
        }

        res.json({ message: 'Saved search deleted successfully' });
    } catch (error) {
        console.error('Error deleting saved search:', error);
        res.status(500).json({ error: 'Failed to delete saved search' });
    }
});

// GET /recommendations - Get personalized recommendations
router.get('/recommendations', auth, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const recommendations = await Search.getRecommendations(userId);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

module.exports = router;

const Agent = require('../models/Agent');
const Property = require('../models/Property');

exports.getAll = async (req, res, next) => {
    try {
        const agents = await Agent.findAll();
        res.json(agents);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // Logic to get agent details + properties
        let agent = await Agent.findById(userId);

        // Fallback: If not found in agents table, check users table (for regular sellers)
        if (!agent) {
            const User = require('../models/User');
            const user = await User.findById(userId);
            if (user && (user.user_type === 'seller' || user.user_type === 'agent')) {
                // Map user to agent-like structure
                agent = {
                    ...user,
                    user_id: user.user_id,
                    profile_image_url: user.profile_image, // Ensure mapping exists
                    // Add dummy agent fields if needed or handle in frontend
                    agency_name: 'Independent Seller',
                    experience_years: 0,
                    license_number: 'N/A',
                    bio: user.bio || 'No bio available'
                };
            }
        }

        let properties = [];
        if (agent) {
            properties = await Property.findAll({ seller_id: agent.user_id });
        } else {
            return res.status(404).json({ error: 'Agent/Seller not found' });
        }

        res.json({ ...agent, properties });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const {
            user_id,
            agency_name,
            license_number,
            bio,
            experience_years,
            languages
        } = req.body;

        const agentId = await Agent.create(user_id, agency_name, license_number, bio, experience_years, languages);
        res.status(201).json({ message: 'Agent created', agent_id: agentId });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const agentId = req.params.id;
        // Verify ownership/admin in a real app
        await Agent.update(agentId, req.body);
        res.json({ message: 'Agent updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteAgent = async (req, res, next) => {
    try {
        if (req.user.user_type !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        await Agent.delete(req.params.id);
        res.json({ message: 'Agent deleted successfully' });
    } catch (err) {
        next(err);
    }
};

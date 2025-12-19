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
        const agent = await Agent.findById(userId); // Assuming findById handles user_id mapping or we fix model later

        let properties = [];
        if (agent) {
            properties = await Property.findAll({ seller_id: agent.user_id });
        } else {
            // Fallback if not found in agents table but is a seller user?
            // For now standardized on Agent model.
            return res.status(404).json({ error: 'Agent not found' });
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

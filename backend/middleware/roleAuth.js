// Role-based authorization middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized - Please login' });
        }

        // Check if user has required role
        const userRole = req.user.user_type;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: 'Forbidden - Insufficient permissions',
                requiredRole: allowedRoles,
                yourRole: userRole
            });
        }

        next();
    };
};

module.exports = { requireRole };

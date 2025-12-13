/**
 * Role-based access control middleware
 * Restricts routes to specific user types
 */

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.user_type)) {
            return res.status(403).json({
                error: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

const requireSeller = requireRole('seller', 'admin');
const requireCustomer = requireRole('buyer', 'admin');
const requireAdmin = requireRole('admin');

module.exports = {
    requireRole,
    requireSeller,
    requireCustomer,
    requireAdmin
};

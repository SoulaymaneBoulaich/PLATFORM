const pool = require('../config/database');

class Appointment {
    // ==========================================
    // APPOINTMENTS (Confirmed/Scheduled meetings)
    // ==========================================

    static async findAllByUserId(userId, userType) {
        let query, params;

        if (userType === 'buyer') {
            query = `
                SELECT 
                  a.*, 
                  p.title as property_title, p.city, p.address,
                  ag.first_name as agent_first_name, ag.last_name as agent_last_name
                FROM appointments a
                JOIN properties p ON a.property_id = p.property_id
                LEFT JOIN agents agt ON a.agent_id = agt.agent_id
                LEFT JOIN users ag ON agt.user_id = ag.user_id
                WHERE a.user_id = ?
                ORDER BY a.appointment_date DESC`;
            params = [userId];
        } else if (userType === 'agent') {
            query = `
                SELECT 
                  a.*, 
                  p.title as property_title, p.city, p.address,
                  u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
                FROM appointments a
                JOIN properties p ON a.property_id = p.property_id
                JOIN users u ON a.user_id = u.user_id
                WHERE a.agent_id IN (SELECT agent_id FROM agents WHERE user_id = ?)
                ORDER BY a.appointment_date DESC`;
            params = [userId];
        } else if (userType === 'seller') {
            query = `
                SELECT 
                  a.*, 
                  p.title as property_title, p.city, p.address,
                  u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
                FROM appointments a
                JOIN properties p ON a.property_id = p.property_id
                JOIN users u ON a.user_id = u.user_id
                WHERE p.seller_id = ?
                ORDER BY a.appointment_date DESC`;
            params = [userId];
        } else {
            // Admin
            query = `
                SELECT 
                  a.*, 
                  p.title as property_title, p.city, p.address,
                  u.first_name as buyer_first_name, u.last_name as buyer_last_name, u.email as buyer_email
                FROM appointments a
                JOIN properties p ON a.property_id = p.property_id
                JOIN users u ON a.user_id = u.user_id
                ORDER BY a.appointment_date DESC`;
            params = [];
        }

        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async findById(appointmentId) {
        const query = `
            SELECT 
                a.*, 
                p.title as property_title, p.city, p.address, p.seller_id,
                u.first_name as buyer_first_name, u.last_name as buyer_last_name,
                ag.first_name as agent_first_name, ag.last_name as agent_last_name
            FROM appointments a
            JOIN properties p ON a.property_id = p.property_id
            JOIN users u ON a.user_id = u.user_id
            LEFT JOIN agents agt ON a.agent_id = agt.agent_id
            LEFT JOIN users ag ON agt.user_id = ag.user_id
            WHERE a.appointment_id = ?
        `;
        const [rows] = await pool.query(query, [appointmentId]);
        return rows[0];
    }

    static async create(userId, propertyId, agentId, appointmentDate, notes) {
        const query = `
            INSERT INTO appointments (property_id, user_id, agent_id, appointment_date, notes, status)
            VALUES (?, ?, ?, ?, ?, 'scheduled')
        `;
        const [result] = await pool.query(query, [propertyId, userId, agentId, appointmentDate, notes || null]);
        return result.insertId;
    }

    static async update(appointmentId, data) {
        const updates = [];
        const values = [];

        if (data.appointment_date) {
            updates.push('appointment_date = ?');
            values.push(data.appointment_date);
        }
        if (data.notes !== undefined) {
            updates.push('notes = ?');
            values.push(data.notes);
        }
        if (data.status) {
            updates.push('status = ?');
            values.push(data.status);
        }

        if (updates.length === 0) return false;
        values.push(appointmentId);

        await pool.query(
            `UPDATE appointments SET ${updates.join(', ')} WHERE appointment_id = ?`,
            values
        );
        return true;
    }

    static async delete(appointmentId) {
        await pool.query('DELETE FROM appointments WHERE appointment_id = ?', [appointmentId]);
        return true;
    }

    // ==========================================
    // VISITS (Pending requests)
    // ==========================================

    static async findAllVisits(userId, role) {
        let query, params;

        if (role.toUpperCase() === 'BUYER') {
            query = `
                SELECT 
                  v.*,
                  p.title as property_title,
                  p.image_url as property_image,
                  p.address_line1,
                  p.city,
                  u.first_name as owner_first_name,
                  u.last_name as owner_last_name
                FROM visits v
                INNER JOIN properties p ON v.property_id = p.property_id
                LEFT JOIN users u ON p.owner_id = u.user_id
                WHERE v.buyer_id = ?
                ORDER BY v.scheduled_at DESC
            `;
            params = [userId];
        } else {
            // Seller/Agent view visits to their properties
            // Note: Original code queried where p.owner_id = ? which is seller_id.
            query = `
                SELECT 
                  v.*,
                  p.title as property_title,
                  p.image_url as property_image,
                  u.first_name as buyer_first_name,
                  u.last_name as buyer_last_name,
                  u.email as buyer_email
                FROM visits v
                INNER JOIN properties p ON v.property_id = p.property_id
                INNER JOIN users u ON v.buyer_id = u.user_id
                WHERE p.owner_id = ?
                ORDER BY v.scheduled_at DESC
            `;
            params = [userId];
        }
        const [rows] = await pool.query(query, params);
        return rows;
    }

    static async findVisitById(visitId) {
        const query = `
            SELECT v.*, p.owner_id 
            FROM visits v
            INNER JOIN properties p ON v.property_id = p.property_id
            WHERE v.visit_id = ?
        `;
        const [rows] = await pool.query(query, [visitId]);
        return rows[0];
    }

    static async createVisit(buyerId, propertyId, scheduledAt, notes) {
        const [result] = await pool.query(
            'INSERT INTO visits (buyer_id, property_id, scheduled_at, notes, status) VALUES (?, ?, ?, ?, ?)',
            [buyerId, propertyId, scheduledAt, notes || null, 'PENDING']
        );
        return result.insertId;
    }

    static async updateVisit(visitId, status, notes) {
        const updates = ['status = ?'];
        const params = [status];

        if (notes) {
            updates.push('notes = ?');
            params.push(notes);
        }
        params.push(visitId);

        await pool.query(
            `UPDATE visits SET ${updates.join(', ')} WHERE visit_id = ?`,
            params
        );
        return true;
    }

    static async deleteVisit(visitId) {
        await pool.query('DELETE FROM visits WHERE visit_id = ?', [visitId]);
        return true;
    }
}

module.exports = Appointment;

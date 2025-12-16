// Seed agents table with sellers
const pool = require('../../config/database');

async function seedAgents() {
    try {
        console.log('Seeding agents table with sellers...\n');

        // Insert agents for all sellers who don't have an agent record
        const [result] = await pool.query(`
            INSERT INTO agents (user_id, license_number, bio)
            SELECT 
                u.user_id,
                CONCAT('LIC-', LPAD(u.user_id, 6, '0')) as license_number,
                'Experienced real estate professional' as bio
            FROM users u
            WHERE u.user_type = 'seller'
              AND NOT EXISTS (
                SELECT 1 FROM agents a WHERE a.user_id = u.user_id
              )
        `);

        console.log(`✓ Inserted ${result.affectedRows} agent records\n`);

        // Verify by showing all agents
        const [agents] = await pool.query(`
            SELECT 
                a.agent_id,
                u.first_name,
                u.last_name,
                u.email,
                a.license_number,
                a.bio
            FROM agents a
            JOIN users u ON a.user_id = u.user_id
            ORDER BY u.first_name
        `);

        console.log(`Total agents in database: ${agents.length}\n`);
        agents.forEach(agent => {
            console.log(`  ✓ ${agent.first_name} ${agent.last_name} (${agent.email})`);
            console.log(`    License: ${agent.license_number}`);
        });

        console.log('\n✅ Seeding complete!');

    } catch (error) {
        console.error('✗ Error:', error.message);
    } finally {
        process.exit();
    }
}

seedAgents();

const fs = require('fs');
const path = require('path');

const envContent = `DB_HOST=metro.proxy.rlwy.net
DB_PORT=18687
DB_USER=root
DB_PASSWORD=JcgkIKLCelozRHmytnwzmVMWWmPmFWsK
DB_NAME=railway
PORT=5000
JWT_SECRET=my_super_secret
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=danyn3veu
CLOUDINARY_API_KEY=428549884232683
CLOUDINARY_API_SECRET=mEyww3qkeBmEIOPACBpnOaLga2I`;

const filePath = path.join(__dirname, '.env');

try {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Force delete existing
    }
    fs.writeFileSync(filePath, envContent, { encoding: 'utf8' });
    console.log('Successfully wrote .env file in UTF-8');
} catch (err) {
    console.error('Error writing .env file:', err);
    process.exit(1);
}

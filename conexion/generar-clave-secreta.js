// Script para generar una clave secreta segura para JWT
// Ejecutar con: node generar-clave-secreta.js

const crypto = require('crypto');

// Generar clave secreta de 64 bytes (512 bits) en formato base64url
const claveSecreta = crypto.randomBytes(64).toString('base64url');

console.log('\n🔐 CLAVE SECRETA GENERADA:');
console.log('='.repeat(80));
console.log(claveSecreta);
console.log('='.repeat(80));
console.log('\n📝 Copia esta clave y úsala en tu archivo .env o en server.js:');
console.log(`JWT_SECRET="${claveSecreta}"`);
console.log('\n');




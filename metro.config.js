// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configurar el puerto del Metro bundler
config.server = {
  ...config.server,
  port: 3000,
};

module.exports = config;


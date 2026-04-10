/**
 * MG Deep Clean - Global Configuration
 * Centralizes the API Base URL for easier deployment.
 */

const CONFIG = {
    // 🛠️ DEVELOPMENT: Using Render API for local testing
    development: "https://mgdeepcleaning-backend.onrender.com",

    // 🌍 PRODUCTION: Your actual Render backend URL
    production: "https://mgdeepcleaning-backend.onrender.com"
};

// Auto-detect environment based on the current website URL
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.API_BASE = isLocal ? CONFIG.development : CONFIG.production;

console.log(`🚀 MG Deep Clean: Connected to ${isLocal ? "Local" : "Production"} API at ${window.API_BASE}`);

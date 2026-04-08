/**
 * MG Deep Clean - Global Configuration
 * Centralizes the API Base URL for easier deployment.
 */

const CONFIG = {
    // 🛠️ DEVELOPMENT: Use localhost
    development: "http://localhost:5000",

    // 🌍 PRODUCTION: Replace with your actual backend URL after deployment
    // Example: "https://api.mgdeepclean.com"
    production: "https://vercel.com/mgdeepcleans-projects/mg-deep-cleaning-backend/FNXicLjuN1jy3RwrPqApPXP1iy1K"
};

// Auto-detect environment based on the current website URL
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.API_BASE = isLocal ? CONFIG.development : CONFIG.production;

console.log(`🚀 MG Deep Clean: Connected to ${isLocal ? "Local" : "Production"} API at ${window.API_BASE}`);

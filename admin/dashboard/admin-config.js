/**
 * MG Deep Clean - Admin Panel Configuration
 * Dedicated configuration for the admin dashboard.
 */

const ADMIN_CONFIG = {
    development: "https://mg-deep-cleaning-backend.vercel.app",
    production: "https://mg-deep-cleaning-backend.vercel.app"
};

// Auto-detect environment based on the current website URL
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

window.API_BASE = isLocal ? ADMIN_CONFIG.development : ADMIN_CONFIG.production;

// console.log(`🔒 MG Admin Vault: System initialized.`);

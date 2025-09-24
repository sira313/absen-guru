// Function to get local IP address (similar to start-network.sh)
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();

module.exports = {
  apps: [
    {
      name: "absen-guru",
      script: "./build/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      env: {
        // Default environment - localhost only (same as pnpm start)
        PORT: 3000,
        HOST: "127.0.0.1", // Localhost only for security
        SESSION_SECRET: "change-this-secret-in-production-2025",
        TZ: "Asia/Jakarta",
        ORIGIN: "http://127.0.0.1:3000",
        // No NODE_ENV set - development mode for localhost
      },
      env_production: {
        // Production environment - for domain/VPS deployment
        NODE_ENV: "production", 
        PORT: 3000,
        HOST: "0.0.0.0", // Network access
        SESSION_SECRET: "change-this-secret-in-production-2025",
        TZ: "Asia/Jakarta",
        // ORIGIN should be set manually for production domain
        // Example: ORIGIN=https://yourdomain.com
      },
      env_network: {
        // Network environment - same as start-network.sh behavior
        PORT: 3000,
        HOST: "0.0.0.0",
        SESSION_SECRET: "change-this-secret-in-production-2025", 
        TZ: "Asia/Jakarta",
        ORIGIN: `http://${LOCAL_IP}:3000`,
        // No NODE_ENV=production - allows network ORIGIN in development mode
      },
    },
  ],

  // PM2 deployment configuration untuk VPS
  // Mengikuti pola setup-linux.sh
  deploy: {
    production: {
      user: "root",
      host: "your-vps-ip", 
      ref: "origin/main",
      repo: "https://github.com/sira313/absen-guru.git",
      path: "/opt/absen-guru",
      "pre-deploy-local": "",
      "post-deploy": 
        "pnpm install && pnpm db:push && pnpm db:seed && pnpm build && pm2 reload ecosystem.config.cjs --env production",
      "pre-setup": 
        "curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && " +
        "apt-get install -y nodejs build-essential python3-dev sqlite3 && " +
        "npm install -g pnpm pm2",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        TZ: "Asia/Jakarta"
      }
    },
  },

  // Commands untuk development dan testing
  // Gunakan: pm2 start ecosystem.config.cjs --env [environment]
  // Default: pm2 start ecosystem.config.cjs (localhost only)
  // Production: pm2 start ecosystem.config.cjs --env production (network access)  
  // Network: pm2 start ecosystem.config.cjs --env network (auto-detect IP)
};

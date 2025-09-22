export default {
  apps: [
    {
      name: 'absen-guru',
      script: './build/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        SESSION_SECRET: 'super-secret-production-key-change-this-now-2025',
        TZ: 'Asia/Jakarta'
        // ORIGIN tidak perlu diset - auto-detected oleh SvelteKit
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        SESSION_SECRET: 'super-secret-production-key-change-this-now-2025',
        TZ: 'Asia/Jakarta'
        // Universal config - cocok untuk any server IP/domain
      }
    }
  ],
  
  // PM2 deployment configuration untuk VPS
  deploy: {
    production: {
      user: 'root',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'https://github.com/sira313/absen-guru.git',
      path: '/root/absen-guru',
      'pre-deploy-local': '',
      'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

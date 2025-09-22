module.exports = {
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
        SESSION_SECRET: 'super-secret-production-key-change-this-now-2024',
        TZ: 'Asia/Jakarta'
        // ORIGIN tidak perlu diset - auto-detected oleh SvelteKit
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        SESSION_SECRET: 'super-secret-production-key-change-this-now-2024',
        TZ: 'Asia/Jakarta'
        // Universal config - cocok untuk any server IP/domain
      }
    }
  ]
};
import adapter from "@sveltejs/adapter-node";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Konfigurasi untuk deployment lintas platform
      out: "build",
      precompress: false,
      envPrefix: "",
    }),
    csrf: {
      // Modern CSRF protection with environment-based configuration
      trustedOrigins: (() => {
        // For network testing (when ORIGIN is set but NODE_ENV is not production)
        // Allow the specific network origin without full production mode
        if (process.env.ORIGIN && process.env.NODE_ENV !== 'production') {
          return [
            'http://localhost:5173',
            'http://localhost:5174', 
            'http://localhost:3000',
            process.env.ORIGIN,
          ];
        }
        
        // For production mode
        if (process.env.NODE_ENV === 'production') {
          return process.env.ORIGIN ? [process.env.ORIGIN] : ['http://localhost:3000'];
        }
        
        // For development (default)
        return [
          'http://localhost:5173',
          'http://localhost:5174', 
          'http://localhost:3000',
        ];
      })(),
    },
  },
};

export default config;

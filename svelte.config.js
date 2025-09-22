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
      // Universal CSRF protection - allow all origins untuk kemudahan deployment
      // Cocok untuk local network, VPS, dan cloud deployment
      trustedOrigins: ["*"],
    },
  },
};

export default config;

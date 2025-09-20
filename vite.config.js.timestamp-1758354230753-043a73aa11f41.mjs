// vite.config.js
import { sveltekit } from "file:///C:/Users/User/Documents/absen-guru/node_modules/.pnpm/@sveltejs+kit@2.42.2_@sveltejs+vite-plugin-svelte@3.1.2_svelte@4.2.20_vite@5.4.20/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import tailwindcss from "file:///C:/Users/User/Documents/absen-guru/node_modules/.pnpm/@tailwindcss+vite@4.1.13_vite@5.4.20/node_modules/@tailwindcss/vite/dist/index.mjs";
import { defineConfig } from "file:///C:/Users/User/Documents/absen-guru/node_modules/.pnpm/vite@5.4.20/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ],
  server: {
    host: "0.0.0.0",
    // Untuk akses dari network lain (RasPi)
    port: 5173
  },
  preview: {
    host: "0.0.0.0",
    port: 4173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERvY3VtZW50c1xcXFxhYnNlbi1ndXJ1XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxVc2VyXFxcXERvY3VtZW50c1xcXFxhYnNlbi1ndXJ1XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9Vc2VyL0RvY3VtZW50cy9hYnNlbi1ndXJ1L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgc3ZlbHRla2l0IH0gZnJvbSAnQHN2ZWx0ZWpzL2tpdC92aXRlJztcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHRhaWx3aW5kY3NzKCksXHJcblx0XHRzdmVsdGVraXQoKVxyXG5cdF0sXHJcblx0c2VydmVyOiB7XHJcblx0XHRob3N0OiAnMC4wLjAuMCcsIC8vIFVudHVrIGFrc2VzIGRhcmkgbmV0d29yayBsYWluIChSYXNQaSlcclxuXHRcdHBvcnQ6IDUxNzNcclxuXHR9LFxyXG5cdHByZXZpZXc6IHtcclxuXHRcdGhvc3Q6ICcwLjAuMC4wJyxcclxuXHRcdHBvcnQ6IDQxNzNcclxuXHR9XHJcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1MsU0FBUyxpQkFBaUI7QUFDNVQsT0FBTyxpQkFBaUI7QUFDeEIsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1IsWUFBWTtBQUFBLElBQ1osVUFBVTtBQUFBLEVBQ1g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1A7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNQO0FBQ0QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K

import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost',
    },
    watch: {
      // Improves reliability of Hot Module Reload on Windows and network drives
      usePolling: true,
    },
  },
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    },
  },
  // Ensure production builds don't reference development server
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  optimizeDeps: {
    include: ["@mui/material", "@mui/icons-material"],
  },
  build: {
    chunkSizeWarningLimit: 100,
    rollupOptions: {
      output: {
        // Prevent code splitting to avoid multiple chunks
        manualChunks: undefined,
        // Ensure single file output
        entryFileNames: 'app-[hash].js',
        chunkFileNames: 'app-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      },
      onwarn(warning, warn) {
        // Suppress "use strict" directive warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        // Suppress commonjs resolver warnings
        if (warning.code === "UNKNOWN" && warning.message.includes("commonjs--resolver")) {
          return;
        }
        warn(warning);
      },
    },
    // Ensure assets are built for production
    outDir: 'public/build',
    assetsDir: '',
    manifest: true,
  },
  plugins: [
    laravel({
      input: ["resources/js/app.jsx"],
      refresh: true,
    }),
    react(), // Enables React Fast Refresh and JSX support
  ],
});

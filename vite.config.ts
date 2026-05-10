import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves the site at /<repo>/, so the build needs that base path.
// `npm run dev` and `npm run preview` use root '/' automatically.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/whatittakes2buyahouse/' : '/',
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(
      process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev',
    ),
  },
}));

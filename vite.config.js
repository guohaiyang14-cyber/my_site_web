import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173, strictPort: true },  // 端口占用直接报错，别偷偷 +1
});
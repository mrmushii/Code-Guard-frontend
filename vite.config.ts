import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import{ nodePolyfills} from 'vite-plugin-node-polyfills'
// https://vite.dev/config/
export default defineConfig({
   define: {
    global: 'window',
  },
  plugins: [react(), tailwindcss(),nodePolyfills(),],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
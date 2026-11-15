import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {splitWasmAssets} from './scripts/split-wasm-assets.mjs';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({define:{__VERCEL_ANALYTICS_ENABLED__:JSON.stringify(process.env.VERCEL==='1'||process.env.VITE_VERCEL_ANALYTICS==='1')},worker:{format:'es',plugins:()=>[splitWasmAssets()]},plugins:[splitWasmAssets(),react(),tailwindcss()]});

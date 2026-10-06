import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import {aiMiddleware} from './server/ai.js';
export default defineConfig(({mode})=>({plugins:[react(),{name:'local-ai-assistance',configureServer(server){server.middlewares.use(aiMiddleware(()=>loadEnv(mode,process.cwd(),'')));},configurePreviewServer(server){server.middlewares.use(aiMiddleware(()=>loadEnv(mode,process.cwd(),'')));}}]}));

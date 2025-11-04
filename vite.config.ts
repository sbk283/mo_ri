import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    /**
     * 프로덕션(배포) 빌드 시 console.log / debugger 자동 제거 됨.
     * 개발 중에는 그대로 출력됨 (디버깅 가능)
     */
    drop: ["console", "debugger"],
  },
});

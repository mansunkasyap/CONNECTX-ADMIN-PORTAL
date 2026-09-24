import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig({
    // GitHub Pages serves project pages from https://<user>.github.io/<repo-name>/,
    // so every built asset URL needs this prefix. Update the name if your repo
    // is named differently.
    base: "/",
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
                silenceDeprecations: ["legacy-js-api"],
            },
        },
    },
});
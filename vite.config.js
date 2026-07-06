import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// base: "./" emits relative asset URLs so the build works at any path:
// root domains AND project subpaths like user.github.io/offervane-site/.
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        trial: fileURLToPath(new URL("./trial/index.html", import.meta.url)),
        thanks: fileURLToPath(new URL("./trial/thanks/index.html", import.meta.url)),
      },
    },
  },
});

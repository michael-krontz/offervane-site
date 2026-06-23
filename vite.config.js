import { defineConfig } from "vite";

// base: "./" emits relative asset URLs so the build works at any path —
// root domains AND project subpaths like user.github.io/offervane-site/.
export default defineConfig({
  base: "./",
});

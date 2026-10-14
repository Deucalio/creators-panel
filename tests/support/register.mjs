import { register } from "node:module";

// Loaded with `node --import` before any test file.
register("./resolve-hook.mjs", import.meta.url);

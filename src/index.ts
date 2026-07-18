import { serve } from "bun";

import index from "./index.html";

const server = serve({
  routes: {
    "/*": index,
  },

  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);

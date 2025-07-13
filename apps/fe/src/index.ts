Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response("Frontend App Ready!");
  },
  development: {
    hmr: true,
    console: true,
  }
});

console.log("Frontend running at http://localhost:3000");
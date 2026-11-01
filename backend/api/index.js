// Vercel serverless entry point.
// The TypeScript source is compiled to dist/ by the buildCommand.
// This file imports the compiled Express app so Vercel's api/ convention
// is used, which preserves the original request URL in req.url.
const exported = require('../dist/index');
module.exports = exported.default || exported;

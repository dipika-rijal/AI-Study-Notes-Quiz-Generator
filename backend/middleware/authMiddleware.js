/**
 * authMiddleware.js
 * Re-exports the protect middleware so routes can use:
 *   const { protect } = require('../middleware/authMiddleware');
 */
const { requireAuth } = require("./auth");

// "protect" is the conventional name used throughout the route files
module.exports = { protect: requireAuth };

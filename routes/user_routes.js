// user_routes.js
const express = require("express");
const router = express.Router();

// Import middleware for validation
const { signupValidation } = require("../helpers/validation"); // Ensure this path is correct

// Import controller
const userController = require("../controllers/user_controller"); // Ensure this path is correct

// Debugging imports
console.log({ signupValidation, userController });

// Route for user registration
router.post("/register", signupValidation, userController.register);

// Export the router
module.exports = router;

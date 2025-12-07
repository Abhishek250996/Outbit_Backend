// useRoutes.js
const express = require("express");
const router = express.Router();

const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  file.mimetype === "image/jpeg" || file.mimetype === "image/png"
    ? cb(null, true)
    : cb(null, false);
};
const upload = multer({ storage: storage, fileFilter: fileFilter });
// Import middleware for validation
const { signupValidation, loginValidation } = require("../helpers/validation"); // Ensure this path is correct

// Import controller
const userController = require("../controllers/userController"); // Ensure this path is correct

// Debugging imports
// console.log({ signupValidation,loginValidation, userController });

// Route for user registration
router.post(
  "/register",
  upload.single("image"),
  signupValidation,
  userController.register
);

router.post(
  "/login",loginValidation,
  userController.login
);
// Export the router
module.exports = router;

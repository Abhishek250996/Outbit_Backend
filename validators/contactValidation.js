const { check } = require("express-validator");

const validateContact = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Valid email is required"),
  check("message").notEmpty().withMessage("Message cannot be empty"),
];

module.exports = { validateContact };

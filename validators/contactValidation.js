const { check } = require("express-validator");

exports.validateContact = [
  check("name", "Name is required").not().isEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("message", "Message cannot be empty").not().isEmpty(),
];

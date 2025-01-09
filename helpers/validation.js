const { check } = require("express-validator");

exports.signupValidation =
 [check('name', 'Name is required').not().isEmpty(),
     check('email', 'Please enter a vaild mail').isEmail().normalizeEmail({gmail_remove_dots:true}), 
    check('password', 'Password is required').isLength({min:6}),];
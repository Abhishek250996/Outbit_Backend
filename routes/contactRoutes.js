const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
} = require("../controllers/userController");


// MIDDLEWARE: for login check
const auth = require("../middleware/auth");
router.get("/admin/contacts", auth, getAllContacts);
router.get("/admin/contacts/:id", auth, getContactById);
router.post("/contact", submitContact);


module.exports = router;

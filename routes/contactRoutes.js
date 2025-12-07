const express = require("express");
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  getContactById,
} = require("../controllers/userController");

const auth = require("../middleware/auth");
const { validateContact } = require("../validators/contactValidation");

// ADMIN ROUTES
router.get("/admin/contacts", auth, getAllContacts);
router.get("/admin/contacts/:id", auth, getContactById);

// USER ROUTE
router.post("/contact", validateContact, submitContact);

module.exports = router;




// const express = require("express");
// const router = express.Router();
// const {
//   submitContact,
//   getAllContacts,
//   getContactById,
// } = require("../controllers/userController");


// // MIDDLEWARE: for login check
// const auth = require("../middleware/auth");
// router.get("/admin/contacts", auth, getAllContacts);
// router.get("/admin/contacts/:id", auth, getContactById);
// // router.post("/contact", submitContact);
// router.post("/contact", validateContact, submitContact);



// module.exports = router;

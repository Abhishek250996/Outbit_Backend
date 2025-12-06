const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const db = require("../config/dbConnections");
const randomString = require("randomstring");
const sendMail = require("../helpers/sendMail");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

/* ===========================
    REGISTER USER
=========================== */
const register = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  // CHECK IF EMAIL ALREADY EXISTS
  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(email)})`,
    (err, result) => {
      if (err) {
        return res.status(500).send({
          msg: "Database error",
          error: err,
        });
      }

      if (result && result.length > 0) {
        return res.status(409).send({ msg: "This email is already in use!" });
      }

      // HASH PASSWORD
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send({
            msg: "Error hashing password",
            error: err,
          });
        }

        let imagePath = req.file ? "images/" + req.file.filename : null;

        const insertQuery = `
          INSERT INTO users (name, email, password, image)
          VALUES (
            ${db.escape(name)},
            ${db.escape(email)},
            ${db.escape(hash)},
            ${db.escape(imagePath)}
          )
        `;

        db.query(insertQuery, (err) => {
          if (err) {
            return res.status(500).send({
              msg: "Error inserting user into database",
              error: err,
            });
          }

          // CREATE VERIFICATION TOKEN
          const randomToken = randomString.generate();
          const mailSubject = "Mail Verification";
          const content = `
            <p>Hi ${name},</p>
            <p>Please <a href="http://127.0.0.1:3000/mail-verification?token=${randomToken}">
            verify your email</a>.</p>
          `;

          sendMail(email, mailSubject, content);

          // STORE TOKEN
          db.query(
            "UPDATE users SET token=? WHERE email=?",
            [randomToken, email],
            (error) => {
              if (error) {
                return res.status(400).send({ msg: error });
              }

              return res.status(200).send({
                msg: "User registered successfully! Please verify your email.",
              });
            }
          );
        });
      });
    }
  );
};

/* ===========================
    VERIFY EMAIL
=========================== */
const verifyMail = (req, res) => {
  const token = req.query.token;

  db.query("SELECT * FROM users WHERE token=? LIMIT 1", token, (err, result) => {
    if (err) {
      console.log(err.message);
      return res.render("404");
    }

    if (result.length === 0) {
      return res.render("404");
    }

    db.query(
      `UPDATE users SET token = NULL, is_verified = 1 WHERE id = '${result[0].id}'`
    );

    return res.render("mail-verification", {
      message: "Your mail has been verified successfully",
    });
  });
};

/* ===========================
    LOGIN USER
=========================== */
const login = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ${db.escape(email)}`;

  db.query(query, (err, result) => {
    if (err) {
      return res.status(400).send({ msg: "Database error", error: err });
    }

    if (result.length === 0) {
      return res.status(401).send({ msg: "Email or password is incorrect" });
    }

    // COMPARE PASSWORD
    bcrypt.compare(password, result[0].password, (bErr, bResult) => {
      if (bErr) {
        return res.status(400).send({
          msg: "Password comparison error",
          error: bErr,
        });
      }

      if (!bResult) {
        return res.status(401).send({
          msg: "Email or password is incorrect",
        });
      }

      // CREATE JWT TOKEN
      const token = jwt.sign(
        {
          id: result[0].id,
          is_admin: result[0].is_admin,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      // UPDATE LAST LOGIN
      db.query(
        `UPDATE users SET last_login = NOW() WHERE id = '${result[0].id}'`
      );

      return res.status(200).send({
        msg: "Login successful",
        token,
        user: result[0],
      });
    }); // <-- Properly closed bcrypt.compare
  }); // <-- Properly closed db.query
}; // <-- Closed login function


module.exports = { register, verifyMail, login };

const nodeMailer = require("nodemailer");
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendMail = async (email, mailSubject, content) => {
    try {
        // Create a transport instance
        const transport = nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // Use TLS for port 587
            requireTLS: true,
            auth: {
                user: SMTP_MAIL,
                pass: SMTP_PASSWORD,
            },
        });

        // Define mail options
        const mailOptions = {
            from: SMTP_MAIL, // Sender's email
            to: email,       // Recipient's email
            subject: mailSubject,
            html: content,
        };

        // Send the email and handle errors or success
        const info = await transport.sendMail(mailOptions);
        console.log("Mail Sent Successfully!:", info.response);
        return info; // Return info if needed for further operations
    } catch (error) {
        console.error("Error sending mail:", error.message);
        throw new Error("Mail sending failed");
    }
};

module.exports = sendMail;

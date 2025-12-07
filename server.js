require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("./config/dbConnections");
const fs = require("fs");
const path = require("path");

// Backend Routes
const userRouter = require("./routes/userRoute");
const webRouter = require("./routes/webRoute");
const contactRoutes = require("./routes/contactRoutes");


// Chatbot Deps
const { Groq } = require("groq-sdk");
const { Pinecone } = require("@pinecone-database/pinecone");

// Init express
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ===============================
//        BACKEND ROUTES
// ===============================
app.use("/api", userRouter);
app.use("/", webRouter);
app.use("/api", contactRoutes);

// ===============================
//        INIT CHATBOT SERVICES
// ===============================
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_KEY
});

const index = pinecone.index("outbit-chatbot"); // 1024-dim index

// ===============================
//        CHATBOT ROUTE
// ===============================
app.post("/chat", async (req, res) => {
  const question = req.body.message;

  try {
    // 1️⃣ Load Local company.txt Data
    const filePath = path.join(__dirname, "chatbot", "company.txt");
    let localCompanyData = "";
    try {
      localCompanyData = fs.readFileSync(filePath, "utf8");
    } catch (fileErr) {
      console.warn("⚠ company.txt not found or unreadable");
    }

    // 2️⃣ Query Pinecone for best matching context
    const results = await index.query({
      vector: new Array(1024).fill(0),  // dummy vector
      topK: 1,
      includeMetadata: true
    });

    const pineconeContext = results.matches?.[0]?.metadata?.text || "";

    // 3️⃣ Merge Both (Pinecone + company.txt)
    const finalContext = `${pineconeContext}\n\n${localCompanyData}`;

    // 4️⃣ Ask Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "Answer ONLY using the Outbit company information provided below. If missing, reply: 'I don't have that information.'"
        },
        {
          role: "user",
          content: `Company Info:\n${finalContext}\n\nUser Question: ${question}`
        }
      ]
    });

    res.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("❌ Chatbot Error:", err);
    res.status(500).json({ error: "Chatbot failed" });
  }
});

// ===============================
//        GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message: err.message,
  });
});

// ===============================
//        START SERVER
// ===============================
app.listen(3000, () => {
  console.log("🚀 Backend + Chatbot running on port 3000");
});

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// require("./config/dbConnections");

// // Backend Routes
// const userRouter = require("./routes/userRoute");
// const webRouter = require("./routes/webRoute");

// // Chatbot Deps
// const { Groq } = require("groq-sdk");
// const { Pinecone } = require("@pinecone-database/pinecone");

// // Init express
// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // ===============================
// //        BACKEND ROUTES
// // ===============================
// app.use("/api", userRouter);
// app.use("/", webRouter);

// // ===============================
// //        INIT CHATBOT SERVICES
// // ===============================
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });

// const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_KEY
// });

// const index = pinecone.index("outbit-chatbot"); // uses existing 1024-dim embeddings

// // ===============================
// //        CHATBOT ROUTE
// // ===============================
// app.post("/chat", async (req, res) => {
//   const question = req.body.message;

//   try {
//     // Query Pinecone for best matching company context
//     const results = await index.query({
//       vector: new Array(1024).fill(0),  // dummy query vector
//       topK: 1,
//       includeMetadata: true
//     });

//     const context = results.matches?.[0]?.metadata?.text || "";

//     // Ask Groq using context
//     const completion = await groq.chat.completions.create({
//       model: "llama-3.1-8b-instant",
//       messages: [
//         {
//           role: "system",
//           content:
//             "Answer ONLY using the Outbit company information. If you don't know, reply: 'I don't have that information.'"
//         },
//         {
//           role: "user",
//           content: `Company Info:\n${context}\n\nUser Question: ${question}`
//         }
//       ]
//     });

//     res.json({
//       reply: completion.choices[0].message.content
//     });

//   } catch (err) {
//     console.error("❌ Chatbot Error:", err);
//     res.status(500).json({ error: "Chatbot failed" });
//   }
// });

// // ===============================
// //        GLOBAL ERROR HANDLER
// // ===============================
// app.use((err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.message = err.message || "Internal Server Error";
//   res.status(err.statusCode).json({
//     message: err.message,
//   });
// });

// // ===============================
// //        START SERVER
// // ===============================
// app.listen(3000, () => {
//   console.log("🚀 Backend + Chatbot running on port 3000");
// });


// require("dotenv").config();

// const express = require('express');
// const cors = require('cors');
// const e = require("express");
// const bodyParser = require('body-parser');
// require("./config/dbConnections");


// const userRouter = require("./routes/userRoute")
// const webRouter = require("./routes/webRoute")
// const app = express();

// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));


// app.use(cors());
// app.use("/api",userRouter)
// app.use("/",webRouter)


// // error handling
// app.use((err,req,res,next)=>{

//     err.statusCode = err.statusCode || 500;
//     err.message = err.message || "Internal Server Error";
//     res.status(err.statusCode).json({
//         message: err.message,

//     });
// });

// app.listen(3000,()=> console.log("Server is running on port 3000"));
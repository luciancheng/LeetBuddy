const { CohereClientV2 } = require("cohere-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Info (keep .env private)
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY || "",
});
const geminiAPIKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(geminiAPIKey);

// Information
const cohereModel = "command-r-plus";
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

// Gemini Config
// const geminiGenerationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 40,
//   maxOutputTokens: 8192,
//   responseMimeType: "text/plain",
// };

// Chat Storage
const cohereChatHistories = new Map();

// Instructions
const cohereInstructions = `Carefully read the Context provided above. It contains information about a programming problem.
This information may include (but is not limited to) the problem title, description, constraints, a follow-up, hints, programming language, user's code, and errors encountered.
Use all of this information to answer the user's question. Provide code examples if necessary.
Explain your reasoning briefly before providing the final answer or code example. If the context is unclear, incomplete, or contains conflicting information, state that clearly.
Be brief with your response.`;

const cohereHistoryInit = [{ role: "system", content: cohereInstructions }];

const geminiInstructions = `Carefully read the Context provided above. It contains information about a programming problem.
This information may include (but is not limited to) the problem title, description, constraints, a follow-up, hints, programming language, user's code, and errors encountered.
Use all of this information, along with the provided diagram (attached as an image), to answer the user's question. Provide code examples if necessary.
Explain your reasoning briefly before providing the final answer or code example. If the context is unclear, incomplete, or contains conflicting information, state that clearly.
Be brief with your response.`;

module.exports = {
  cohere,
  cohereModel,
  geminiModel,
  cohereHistoryInit,
  geminiInstructions,
  cohereChatHistories,
};

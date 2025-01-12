const { CohereClientV2 } = require("cohere-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('redis');

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

// Redis client for Cohere Chat History
let redisClient = null;

const redisReady = (async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379'
    });

    redisClient.on('error', err => console.error('Redis Client Error:', err));

    try {
      await redisClient.connect();
      console.log("Connected to redis.")
    } catch (err) {
      console.error('Error connecting to Redis:', err);
      redisClient = null;
      throw err;
    }
  }
  return redisClient;
})();

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
  getRedisClient: async () => {
    await redisReady;
    return redisClient;
  },
  initializeRedisClient: () => redisReady,
};

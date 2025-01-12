// do all end point requests here, GET, POST, PUT, DELETE

// Imports
const {
  cohere,
  cohereModel,
  geminiModel,
  cohereHistoryInit,
  geminiInstructions,
  getRedisClient,
} = require("../services/LLM_config.js");

// Main AI Response code.
const AIGeneration = async (req, res) => {
  try {
    const { question, image, context, sessionID } = req.body;

    const redisClient = await getRedisClient();

    if (!redisClient) {
      throw new Error("Redis client not initialized");
    }

    if (!question) {
      return res.status(400).send("User Question is required.");
    }

    if (!sessionID) {
      return res.status(400).send("Session ID is required.");
    }

    // Create the prompt and push the prompt to history
    let response = "";
    let prompt = "";
    prompt += `Context: ${context}\n\n`;
    prompt += `User Question: ${question}\n\n`;
    // Use Cohere for text
    if (!image) {
      let cohereChatHistory = [];
      const redisKey = `chat:${sessionID}`;
      const existingHistory = await redisClient.lRange(redisKey, 0, -1);

      if (!existingHistory || existingHistory.length === 0) {
        // Setup the Cohere inital instructions
        cohereChatHistory = JSON.parse(JSON.stringify(cohereHistoryInit));
        const serializedInit = cohereHistoryInit.map((msg) =>
          JSON.stringify(msg)
        );
        await redisClient.rPush(redisKey, ...serializedInit);
      } else {
        // Get the current chat history
        cohereChatHistory = existingHistory.map((msg) => JSON.parse(msg));
      }

      // Add new user message to the history array
      cohereChatHistory.push({ role: "user", content: prompt });

      // Get Cohere response with complete history
      const result = await cohere.chat({
        model: cohereModel,
        messages: cohereChatHistory,
      });
      response = result.message.content[0].text;

      // Push just the new messages
      const serializedNewMessages = [
        JSON.stringify({ role: "user", content: prompt }),
        JSON.stringify({ role: "assistant", content: response }),
      ];

      await redisClient.rPush(redisKey, ...serializedNewMessages);
      await redisClient.expire(redisKey, 3600);

      // Use Gemini for Images
    } else {
      prompt += `Instructions: ${geminiInstructions}`;
      const prompt_parts = [
        {
          text: prompt,
        },
        {
          inlineData: { mimeType: "image/png", data: image },
        },
      ];

      const full_prompt = {
        parts: prompt_parts,
      };

      const result = await geminiModel.generateContent({
        contents: [full_prompt],
      });
      response = result.response.candidates[0].content.parts[0].text;
    }

    // Send the resonse back to the frontend
    res.send({ res: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while generating the response.");
  }
};

// add functions made to the export list
module.exports = {
  AIGeneration,
};

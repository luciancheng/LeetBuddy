// do all end point requests here, GET, POST, PUT, DELETE

// Imports
const {
  cohere,
  cohereModel,
  geminiModel,
  cohereHistoryInit,
  geminiInstructions,
  cohereChatHistories,
} = require("../services/LLM_config.js");

// Main AI Response code.
const AIGeneration = async (req, res) => {
  try {
    const { question, image, context, sessionID } = req.body;

    if (!question) {
      return res.status(400).send("User Question is required.");
    }

    // Create the prompt and push the prompt to history
    let response = "";
    let prompt = "";
    prompt += `Context: ${context}\n\n`;
    prompt += `User Question: ${question}\n\n`;
    // Use Cohere for text
    if (!image) {
      // Initialize chatHistory for cohere context
      if (!cohereChatHistories.has(sessionID)) {
        cohereChatHistories.set(
          sessionID,
          JSON.parse(JSON.stringify(cohereHistoryInit))
        );
      }
      const cohereChatHistory = cohereChatHistories.get(sessionID);
      cohereChatHistory.push({
        role: "user",
        content: prompt,
      });
      const result = await cohere.chat({
        model: cohereModel,
        messages: cohereChatHistory,
      });
      response = result.message.content;

      // Push response to history
      cohereChatHistory.push({
        role: "assistant",
        content: response,
      });
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

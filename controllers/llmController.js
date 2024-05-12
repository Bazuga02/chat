const { getLLMResponse } = require("../utils/llmUtils");

exports.getResponse = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Call the LLM API and get the response
    const response = await getLLMResponse(prompt);

    res.status(200).json({ response });
  } catch (err) {
    next(err);
  }
};

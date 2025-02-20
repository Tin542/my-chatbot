import OpenAI from "openai";

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const ASSISTANT_KEY = process.env.NEXT_PUBLIC_OPENAI_ASSISTANT_KEY;

// Ensure API key is available
if (!API_KEY || !ASSISTANT_KEY) {
  throw new Error("Missing OpenAI API key or Assistant Key in environment variables");
}

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: false, // Ensuring it's server-side only
});

async function createThread() {
  try {
    console.log("Creating a new thread...");
    return await openai.beta.threads.create();
  } catch (error) {
    console.error("Error creating thread:", error);
    throw new Error("Failed to create a new thread");
  }
}

async function addMessage(threadId, message) {
  try {
    console.log("Adding user message to thread...");
    return await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: message,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    throw new Error("Failed to add message to thread");
  }
}

async function runAssistant(threadId, assistantId) {
  try {
    console.log("Running assistant for the thread...");
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });
  } catch (error) {
    console.error("Error running assistant:", error);
    throw new Error("Failed to run assistant");
  }
}

async function checkStatus(threadId, runId) {
  try {
    let attempts = 0;
    const maxAttempts = 20; // Poll for a max of ~20 seconds
    const delay = 1000; // 1 second per attempt

    while (attempts < maxAttempts) {
      const runObject = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log(`Attempt ${attempts + 1}: Assistant status - ${runObject.status}`);

      if (runObject.status === "completed") {
        const messagesList = await openai.beta.threads.messages.list(threadId, {
          order: "desc",
        });

        if (messagesList.data.length > 0 && messagesList.data[0].content[0].type === "text") {
          return messagesList.data[0].content[0].text.value;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for the next attempt
      attempts++;
    }

    throw new Error("Assistant response timeout");
  } catch (error) {
    console.error("Error checking assistant status:", error);
    throw new Error("Failed to retrieve assistant response");
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid input. Message is required." });
    }

    console.log("Received message:", message);

    // Retrieve Assistant
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_KEY);
    
    // Create thread and send user message
    const thread = await createThread();
    await addMessage(thread.id, message);

    // Run assistant and wait for response
    const run = await runAssistant(thread.id, assistant.id);
    const responseText = await checkStatus(thread.id, run.id);

    return res.status(200).json({ message: responseText });

  } catch (error) {
    console.error("Error processing chat request:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

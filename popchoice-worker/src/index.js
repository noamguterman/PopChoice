import OpenAI from 'openai';
import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request, env, ctx) {
    try {
      // Initialize clients
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY);

      // Handle CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      // Only accept POST requests
      if (request.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
      }

      // Parse the request body
      const { query } = await request.json();
      
      if (!query) {
        return new Response("Query is required", { status: 400 });
      }

      // Create embedding for the query
      const embedding = await createEmbedding(openai, query);
      
      // Find nearest matching movie description
      const matchingText = await findNearestMatch(supabase, embedding);
      
      // Get AI response
      const response = await getChatCompletion(openai, matchingText, query);

      return new Response(JSON.stringify({ response }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};

// Create an embedding vector representing the query
async function createEmbedding(openai, input) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input
  });
  
  return embeddingResponse.data[0].embedding;
}

// Query Supabase and return a semantically matching text chunk
async function findNearestMatch(supabase, embedding) {
  const { data } = await supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.75,
    match_count: 1
  });
  
  if (!data || data.length === 0) {
    throw new Error("No matching movies found");
  }
  
  return data[0].content;
}

// Use OpenAI to make the response conversational
const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    You will be given two pieces of information - some context about movies and a user's preference. 
    Your main job is to formulate a short answer to the question using the provided context. 
    If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." 
    Please do not make up the answer. Always speak as if you were chatting to a friend.`
};

async function getChatCompletion(openai, text, query) {
  const messages = [
    SYSTEM_PROMPT,
    {
      role: 'user',
      content: `Context: ${text} User preference: ${query}`
    }
  ];
  
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages,
    temperature: 0.65,
    frequency_penalty: 0.5
  });
  
  return chatCompletion.choices[0].message.content;
}
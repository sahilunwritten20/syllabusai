const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

let index;
let openai;

const initVectorDB = async () => {
  if (!process.env.PINECONE_API_KEY) {
    console.log('⚠️ Pinecone not configured');
    return;
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY
  });

  index = pinecone.index(process.env.PINECONE_INDEX);

  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('✅ Vector DB Ready');
};

const createEmbedding = async (text) => {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });

  return res.data[0].embedding;
};

const saveMemory = async (userId, text) => {
  if (!index) return;

  const embedding = await createEmbedding(text);

  await index.upsert([
    {
      id: `${userId}-${Date.now()}`,
      values: embedding,
      metadata: { userId, text }
    }
  ]);
};

const searchMemory = async (userId, query) => {
  if (!index) return [];

  const embedding = await createEmbedding(query);

  const res = await index.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
    filter: { userId }
  });

  return res.matches;
};

module.exports = { initVectorDB, saveMemory, searchMemory };
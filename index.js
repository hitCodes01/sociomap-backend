const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Helper function to generate recommendations using OpenAI
async function generateRecommendations(location, description, category) {
  try {
    const prompt = `Generate policy recommendations for ${category} for a community located in ${location} with the following description: ${description}. 
    The recommendations should be specific, actionable, and relevant to the local context. 
    Format the response with 3-5 specific policy recommendations, each with a title and explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are SocioMap®, an AI policy advisor specialized in social equity and community resilience.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw new Error('Failed to generate recommendations');
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('SocioMap API is running');
});

// Economic Equity recommendations
app.post('/api/recommendations/economic-equity', async (req, res) => {
  try {
    const { location, description } = req.body;
    if (!location || !description) {
      return res.status(400).json({ error: 'Location and description are required' });
    }

    const recommendations = await generateRecommendations(location, description, 'Economic Equity');
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public Health recommendations
app.post('/api/recommendations/public-health', async (req, res) => {
  try {
    const { location, description } = req.body;
    if (!location || !description) {
      return res.status(400).json({ error: 'Location and description are required' });
    }

    const recommendations = await generateRecommendations(location, description, 'Public Health');
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disaster Preparedness recommendations
app.post('/api/recommendations/disaster-preparedness', async (req, res) => {
  try {
    const { location, description } = req.body;
    if (!location || !description) {
      return res.status(400).json({ error: 'Location and description are required' });
    }

    const recommendations = await generateRecommendations(location, description, 'Disaster Preparedness');
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all recommendations in a single request (efficiency option)
app.post('/api/recommendations/all', async (req, res) => {
  try {
    const { location, description } = req.body;
    if (!location || !description) {
      return res.status(400).json({ error: 'Location and description are required' });
    }

    const [economicEquity, publicHealth, disasterPreparedness] = await Promise.all([
      generateRecommendations(location, description, 'Economic Equity'),
      generateRecommendations(location, description, 'Public Health'),
      generateRecommendations(location, description, 'Disaster Preparedness')
    ]);

    res.json({
      economicEquity,
      publicHealth,
      disasterPreparedness
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Policy simulator endpoint
app.post('/api/simulator', (req, res) => {
  try {
    const { budget, targetPopulation, policyCategory } = req.body;
    
    // Simple simulation logic (can be replaced with more sophisticated models)
    let efficiencyMultiplier = 1.0;
    
    // Different multipliers based on policy category
    switch(policyCategory) {
      case 'economic-equity':
        efficiencyMultiplier = 1.2;
        break;
      case 'public-health':
        efficiencyMultiplier = 1.5;
        break;
      case 'disaster-preparedness':
        efficiencyMultiplier = 0.9;
        break;
      default:
        efficiencyMultiplier = 1.0;
    }
    
    const result = (budget / targetPopulation) * efficiencyMultiplier;
    
    res.json({ 
      result, 
      message: `Simulation complete for ${policyCategory}` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server if not in production (Vercel will handle this)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
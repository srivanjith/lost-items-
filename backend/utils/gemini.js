const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Compare a lost item with a list of candidate found items using Gemini API.
 * @param {Object} lostItem - { item_name, category, description, location, date_lost }
 * @param {Array} foundItems - Array of { id, item_name, category, description, location, date_found }
 * @returns {Promise<Array>} List of comparison results: { found_item_id, similarity_score, match_analysis, confidence }
 */
async function compareItemsWithAI(lostItem, foundItems) {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in the environment. Returning mock similarity scores.");
    return mockCompareItems(lostItem, foundItems);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
You are an AI assistant for a College Lost and Found portal. Your job is to semantically compare a single lost item against a list of candidate found items and determine how likely they are to be the same physical object.

Lost Item:
- Name: "${lostItem.item_name}"
- Category: "${lostItem.category}"
- Description: "${lostItem.description}"
- Location: "${lostItem.location}"
- Date Lost: "${lostItem.date_lost}"

Candidate Found Items:
${foundItems.map((item, idx) => `
Candidate #${idx + 1}:
- ID: ${item.id}
- Name: "${item.item_name}"
- Category: "${item.category}"
- Description: "${item.description}"
- Location: "${item.location}"
- Date Found: "${item.date_found}"
`).join('\n')}

Task:
Compare the Lost Item with each Candidate.
For each candidate, assign a similarity score from 0 to 100 based on semantic similarity of the item name, description (matching key characteristics like brand, color, condition, model), category, location, and date (items found shortly after they are lost in nearby locations are more likely to match).
Provide a brief, clear, natural language explanation (match_analysis) of the match, summarizing why it matches or highlighting any notable discrepancies.
Categorize the match confidence as "high", "medium", or "low" (or "none" if not a match).

Respond strictly in JSON format matching this schema:
{
  "comparisons": [
    {
      "found_item_id": number,
      "similarity_score": number,
      "match_analysis": "string",
      "confidence": "string"
    }
  ]
}
Do not return any markdown formatting outside of the JSON block. Do not include markdown code block syntax (like \`\`\`json). Just the raw JSON content.
`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("No response text returned from Gemini API");
    }

    const result = JSON.parse(textResponse.trim());
    return result.comparisons || [];
  } catch (error) {
    console.error("Error in Gemini comparison service:", error);
    return mockCompareItems(lostItem, foundItems);
  }
}

/**
 * Deep 1-to-1 comparison of a lost item and a found item.
 */
async function verifySingleMatchWithAI(lostItem, foundItem) {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined in the environment. Returning mock verification.");
    return mockVerifySingle(lostItem, foundItem);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `
You are an AI assistant for a College Lost and Found portal. Perform a deep, thorough semantic comparison between a lost item and a found item to verify if they could be the exact same physical object.

Lost Item:
- Name: "${lostItem.item_name}"
- Category: "${lostItem.category}"
- Description: "${lostItem.description}"
- Location: "${lostItem.location}"
- Date Lost: "${lostItem.date_lost}"

Found Item:
- Name: "${foundItem.item_name}"
- Category: "${foundItem.category}"
- Description: "${foundItem.description}"
- Location: "${foundItem.location}"
- Date Found: "${foundItem.date_found}"

Provide:
1. similarity_score: A number from 0 to 100.
2. match_verdict: "highly_likely", "possible", "unlikely".
3. analysis_details: A detailed breakdown comparing their brand, color, specific details, location, and dates.
4. matching_points: An array of strings representing key matching features (e.g., "Same blue silicone case", "Cracked screen protector matches").
5. discrepancies: An array of strings representing any differences (e.g., "Found 5 days after lost date", "Lost at Library but found at Gym").

Respond strictly in JSON format matching this schema:
{
  "similarity_score": number,
  "match_verdict": "string",
  "analysis_details": "string",
  "matching_points": ["string"],
  "discrepancies": ["string"]
}
Do not return any markdown formatting outside of the JSON block. Do not include markdown code block syntax (like \`\`\`json). Just the raw JSON content.
`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("No response text returned from Gemini API");
    }

    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error("Error in Gemini verification service:", error);
    return mockVerifySingle(lostItem, foundItem);
  }
}

// Fallback mock comparison function
function mockCompareItems(lostItem, foundItems) {
  return foundItems.map(item => {
    let score = 20; // base score
    let reasons = [];
    
    if (lostItem.category.toLowerCase() === item.category.toLowerCase()) {
      score += 25;
      reasons.push("same category");
    }

    const name1 = lostItem.item_name.toLowerCase();
    const name2 = item.item_name.toLowerCase();
    const nameWords1 = name1.split(/[^a-z0-9]+/);
    const nameWords2 = name2.split(/[^a-z0-9]+/);
    const commonName = nameWords1.filter(w => nameWords2.includes(w) && w.length > 2);
    if (commonName.length > 0) {
      score += 20;
      reasons.push(`matching name terms (${commonName.join(', ')})`);
    } else if (name1.includes(name2) || name2.includes(name1)) {
      score += 15;
      reasons.push("partial name match");
    }

    const descWords1 = lostItem.description.toLowerCase().split(/[^a-z0-9]+/);
    const descWords2 = item.description.toLowerCase().split(/[^a-z0-9]+/);
    const commonDesc = descWords1.filter(w => descWords2.includes(w) && w.length > 3);
    if (commonDesc.length > 0) {
      score += 20;
      reasons.push("similar description key details");
    }

    const loc1 = lostItem.location.toLowerCase();
    const loc2 = item.location.toLowerCase();
    if (loc1 === loc2) {
      score += 15;
      reasons.push("exact location match");
    } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
      score += 10;
      reasons.push("matching location area");
    }

    // Date proximity score
    const d1 = new Date(lostItem.date_lost);
    const d2 = new Date(item.date_found);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) {
      score += 20;
      reasons.push("highly correlated report dates");
    } else if (diffDays <= 7) {
      score += 10;
      reasons.push("nearby report dates");
    }

    score = Math.min(100, score);
    let confidence = "low";
    if (score >= 75) confidence = "high";
    else if (score >= 45) confidence = "medium";

    return {
      found_item_id: item.id,
      similarity_score: score,
      match_analysis: `[Fallback Engine] The item matches on ${reasons.join(', ') || 'general characteristics'}. Dates are within ${diffDays} days.`,
      confidence: confidence
    };
  });
}

// Fallback mock verification function
function mockVerifySingle(lostItem, foundItem) {
  const compared = mockCompareItems(lostItem, [foundItem])[0];
  const verdictMap = { "high": "highly_likely", "medium": "possible", "low": "unlikely" };
  
  const d1 = new Date(lostItem.date_lost);
  const d2 = new Date(foundItem.date_found);
  const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));

  const matching_points = ["Category overlap", "Text keywords match"];
  if (lostItem.location.toLowerCase() === foundItem.location.toLowerCase()) {
    matching_points.push("Exact location match");
  }
  if (diffDays <= 3) {
    matching_points.push(`Extremely close date range (${diffDays} days)`);
  }

  const discrepancies = [];
  if (diffDays > 7) {
    discrepancies.push(`Report dates differ by ${diffDays} days`);
  }
  if (lostItem.location.toLowerCase() !== foundItem.location.toLowerCase()) {
    discrepancies.push(`Locations differ: "${lostItem.location}" vs "${foundItem.location}"`);
  }

  return {
    similarity_score: compared.similarity_score,
    match_verdict: verdictMap[compared.confidence] || "unlikely",
    analysis_details: `[Fallback Analysis] The lost item is "${lostItem.item_name}" reported at "${lostItem.location}" on ${lostItem.date_lost}. The found item is "${foundItem.item_name}" reported at "${foundItem.location}" on ${foundItem.date_found}. The Jaccard/heuristics calculation score is ${compared.similarity_score}%. (To enable advanced semantic comparison, add a GEMINI_API_KEY in backend/.env)`,
    matching_points,
    discrepancies
  };
}

module.exports = {
  compareItemsWithAI,
  verifySingleMatchWithAI
};

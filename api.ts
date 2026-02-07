
import { GoogleGenAI, Type } from "@google/genai";
import { WasteAnalysisRequest, WasteAnalysisResponse } from './types';

/**
 * Performs industrial waste analysis using Gemini AI.
 * Replaces the local backend call with an intelligent AI-driven analysis.
 */
export const analyzeWaste = async (data: WasteAnalysisRequest): Promise<WasteAnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey.includes('your_actual_key')) {
    throw new Error('API Key is missing. Please set the API_KEY environment variable.');
  }

  // Initialize the Gemini API client
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following industrial waste material and provide a detailed sustainability and financial report in JSON format:
      Description: ${data.description}
      Quantity: ${data.quantity} kg
      Hazard Level: ${data.hazard}
      Location: ${data.location}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { 
              type: Type.STRING, 
              description: "The primary industrial category of the waste material" 
            },
            buyer: { 
              type: Type.STRING, 
              description: "The most likely industrial buyer or recycling facility type" 
            },
            revenue: { 
              type: Type.NUMBER, 
              description: "Estimated total revenue in USD for the provided quantity" 
            },
            savings: { 
              type: Type.NUMBER, 
              description: "Estimated total cost savings in USD compared to landfill disposal" 
            },
            co2: { 
              type: Type.NUMBER, 
              description: "Estimated CO2 offset in metric tons by recycling instead of disposing" 
            },
            landfill: { 
              type: Type.NUMBER, 
              description: "Percentage (0-100) of material successfully diverted from landfill" 
            },
          },
          required: ['category', 'buyer', 'revenue', 'savings', 'co2', 'landfill'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Analysis failed to produce a valid response.');
    }

    return JSON.parse(resultText) as WasteAnalysisResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error('The industrial analysis service is currently unavailable. Please check your network or API key.');
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import type { PlasticClassification, ReuseIdea, FootprintResult, GeoAnalysisResult, Insight, InsightDetails, DIYTutorial, RecyclingRules, MaterialDatabaseItem } from '../types';

let aiInstance: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const key = (typeof process !== 'undefined' && (process.env?.API_KEY || process.env?.GEMINI_API_KEY)) || '';
    aiInstance = new GoogleGenAI({ apiKey: key || 'dummy-key' });
  }
  return aiInstance;
};

const ai = {
  get models() {
    return getAI().models;
  },
  get chats() {
    return getAI().chats;
  }
};

const GEMINI_MODEL = 'gemini-3.8-flash';

const FALLBACK_INSIGHTS: Insight[] = [
    {
        id: 'news_1',
        type: 'news',
        title: 'Breakthrough Enzyme Breaks Down PET Plastics in Hours',
        description: 'Biochemists engineered a high-efficiency bacterial enzyme capable of depolymerizing post-consumer PET bottles into virgin-quality monomers in less than 16 hours.'
    },
    {
        id: 'tip_1',
        type: 'tip',
        title: 'The "Scrunch Test" for Packaging Plastics',
        description: 'If a flexible plastic wrapper scrunches into a ball and bounces back, it is multi-layer film; if it stays crinkled, it is often accepted in specialized clean polyethylene drop-offs.'
    },
    {
        id: 'comm_1',
        type: 'community',
        title: 'Global Clean Rivers Initiative Intercepts 15,000 Tons',
        description: 'Community-backed river barriers and smart automated collector skiffs have successfully intercepted over 15,000 tons of plastic debris before entering the oceans.'
    }
];

const FALLBACK_DETAILS: Record<string, InsightDetails> = {
    news_1: {
        title: 'Breakthrough Enzyme Breaks Down PET Plastics in Hours',
        summary: 'Engineered biological enzymes can now dissolve polyethylene terephthalate (PET) into its core chemical constituents within 16 hours at moderate temperatures, enabling infinitely circular food-grade recycling.',
        keyPoints: [
            'Operates under 70°C without requiring harsh toxic industrial solvents.',
            'Yields purified terephthalic acid (PTA) with over 95% recovery rate.',
            'Can process dyed, mixed, and soiled consumer plastic waste directly.',
            'Pilot bio-recycling facilities slated for operational expansion worldwide.'
        ],
        timeline: [
            { date: 'Initial Discovery', description: 'Identification of Ideonella sakaiensis bacterium enzymes at waste dump sites.' },
            { date: 'Genetic Optimization', description: 'Protein structural engineering to increase thermal stability and reaction speed tenfold.' },
            { date: 'Industrial Pilot', description: 'Successful demonstration of closed-loop circular bottle-to-bottle synthesis.' }
        ]
    },
    tip_1: {
        title: 'The "Scrunch Test" for Packaging Plastics',
        summary: 'Sorting plastic films and wraps correctly at home prevents widespread contamination in municipal automated sorting facilities.',
        keyPoints: [
            'Scrunch the plastic firmly into a tight fist ball.',
            'If it springs back like a spring, it is composite multi-polymer and belongs in general waste.',
            'If it remains crumpled and holds its crumpled shape, it is pure low-density polyethylene (LDPE #4).',
            'Always ensure plastics are clean and completely free of residual food grease.'
        ]
    },
    comm_1: {
        title: 'Global Clean Rivers Initiative Intercepts 15,000 Tons',
        summary: 'Autonomous solar-powered river barriers and grassroots cleanup coalitions are stopping the largest sources of ocean plastics before they reach open waters.',
        keyPoints: [
            'Installed across 28 of the highest-debris urban waterways worldwide.',
            '100% solar-powered autonomous extraction skiffs operating around the clock.',
            'Collected debris is sorted, sanitized, and channeled into construction aggregate.',
            'Surpassed the major milestone of 15,000 metric tons diverted.'
        ],
        timeline: [
            { date: 'Phase 1', description: 'Hydrological tracking of urban river trash flows and debris choke-points.' },
            { date: 'Phase 2', description: 'Deployment of solar barrier fleets and automated collection barges.' },
            { date: 'Milestone', description: 'Celebrated diversion of over 15,000 tons with community partners.' }
        ],
        progress: 75
    }
};

const getLanguageName = (code: string) => {
    switch (code) {
        case 'hi': return 'Hindi';
        case 'te': return 'Telugu';
        case 'ta': return 'Tamil';
        case 'bn': return 'Bengali';
        case 'mr': return 'Marathi';
        case 'gu': return 'Gujarati';
        case 'kn': return 'Kannada';
        case 'ml': return 'Malayalam';
        case 'or': return 'Odia';
        case 'pa': return 'Punjabi';
        case 'as': return 'Assamese';
        default: return 'English';
    }
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const classifyPlastic = async (imageFile: File, languageCode: string): Promise<PlasticClassification | null> => {
  try {
    const languageName = getLanguageName(languageCode);
    const imagePart = await fileToGenerativePart(imageFile);
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          { text: `Analyze this image of a plastic item. Identify the plastic type (e.g., PET, HDPE), its general recyclability, estimated decomposition time, and carbon impact. Provide a confidence score between 0 and 1. Respond ONLY with a valid JSON object matching the provided schema. The text values in the JSON response must be in ${languageName}.` },
          imagePart,
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plasticType: { type: Type.STRING },
            recyclability: { type: Type.STRING },
            decompositionTime: { type: Type.STRING },
            carbonImpact: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
          },
          required: ["plasticType", "recyclability", "decompositionTime", "carbonImpact", "confidenceScore"],
        },
      },
    });
    const json = JSON.parse(response.text);
    return json as PlasticClassification;
  } catch (error) {
    console.error("Error in classifyPlastic:", error);
    return null;
  }
};

export const getReuseIdeas = async (plasticType: string, languageCode: string): Promise<ReuseIdea[]> => {
    try {
        const languageName = getLanguageName(languageCode);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `You are an expert in creative DIY and upcycling. Brainstorm 2-3 innovative and practical reuse ideas for a '${plasticType}' item. For each idea, provide a short, catchy title and a one-sentence description. Respond ONLY with a valid JSON array matching the provided schema. The response must be in ${languageName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                        },
                        required: ["title", "description"],
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as ReuseIdea[];
    } catch (error) {
        console.error("Error getting reuse ideas:", error);
        return [];
    }
};

export const getDIYTutorial = async (ideaTitle: string, plasticType: string, languageCode: string): Promise<DIYTutorial | null> => {
    try {
        const languageName = getLanguageName(languageCode);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `You are a helpful DIY assistant. Generate a simple, step-by-step DIY tutorial for turning a '${plasticType}' item into a '${ideaTitle}'. The steps should be clear and for a beginner to follow. Provide a list of materials needed (including the plastic item itself) and the steps. Respond ONLY with a valid JSON object matching the provided schema. The response must be in ${languageName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        materials: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        steps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["materials", "steps"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as DIYTutorial;
    } catch (error) {
        console.error("Error getting DIY tutorial:", error);
        return null;
    }
};


export const calculateFootprint = async (usageData: { bottles: number; bags: number; containers: number }, languageCode: string): Promise<FootprintResult | null> => {
    try {
        const languageName = getLanguageName(languageCode);
        const usageJson = JSON.stringify(usageData);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Based on the following weekly plastic usage data, calculate the user's estimated monthly plastic footprint in kg. Also provide the national average for comparison (use a realistic average for a developed country, like 5kg/month). Finally, offer 3 concise, actionable recommendations for reduction. Respond ONLY with a valid JSON object matching the provided schema. Usage data: ${usageJson}. The recommendations must be in ${languageName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        monthlyFootprintKg: { type: Type.NUMBER },
                        nationalAverageKg: { type: Type.NUMBER },
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["monthlyFootprintKg", "nationalAverageKg", "recommendations"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as FootprintResult;
    } catch (error) {
        console.error("Error in calculateFootprint:", error);
        return null;
    }
}

export const getPlasticGeoAnalysis = async (lat: number, lng: number, languageCode: string, locationName?: string): Promise<GeoAnalysisResult | null> => {
  try {
    const languageName = getLanguageName(languageCode);
    const prompt = `You are a geo-spatial environmental data analyst. For the location at latitude ${lat} and longitude ${lng} ${locationName ? `(known as ${locationName})` : ''}, generate a realistic, plausible analysis of plastic waste.
    Instructions:
    1.  First, reason about the location's economic status (developed/developing), geography (coastal/inland), and population density to inform your data. State this reasoning in the 'dataRationale' field.
    2.  Determine a plausible official name for the location (e.g., "Tokyo, Japan" or "Rural Region, Brazil").
    3.  Provide a brief 1-2 sentence summary.
    4.  Generate three key statistics with values and descriptions.
    5.  Create a plausible percentage breakdown for waste composition (e.g., PET, HDPE, PVC, Other). The total must sum to 100.
    6.  Create a plausible percentage breakdown for waste management (e.g., Recycled, Landfilled, Incinerated, Mismanaged). The total must sum to 100.
    7.  Create a plausible trend for waste generation over the last 5 years.
    Respond ONLY with a valid JSON object matching the schema. All text content in the response must be in ${languageName}.`;

    const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    locationName: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    dataRationale: { type: Type.STRING },
                    keyStats: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                stat: { type: Type.STRING },
                                value: { type: Type.STRING },
                                description: { type: Type.STRING }
                            },
                             required: ["stat", "value", "description"]
                        }
                    },
                    wasteComposition: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } },
                            required: ["name", "value"]
                        }
                    },
                    wasteManagement: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } },
                             required: ["name", "value"]
                        }
                    },
                    generationTrend: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { year: { type: Type.STRING }, waste_in_million_tons: { type: Type.NUMBER } },
                            required: ["year", "waste_in_million_tons"]
                        }
                    }
                },
                 required: ["locationName", "summary", "keyStats", "wasteComposition", "wasteManagement", "generationTrend"]
            }
        }
    });
    const json = JSON.parse(response.text);
    return json as GeoAnalysisResult;
  } catch(error) {
    console.error("Error in getPlasticGeoAnalysis:", error);
    return null;
  }
}

export const geocodeLocation = async (query: string, languageCode: string): Promise<{ lat: number, lng: number, foundLocationName: string }> => {
    try {
        const languageName = getLanguageName(languageCode);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `You are a geocoding expert. Convert the following location query into latitude and longitude coordinates, and provide a formatted name for the location. Query: "${query}". Respond ONLY with a valid JSON object matching the provided schema. The 'foundLocationName' must be in ${languageName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        foundLocationName: { type: Type.STRING }
                    },
                    required: ["lat", "lng", "foundLocationName"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as { lat: number, lng: number, foundLocationName: string };
    } catch (error) {
        console.error("Error in geocodeLocation:", error);
        throw new Error("Failed to geocode location.");
    }
};

export const getLatestInsights = async (languageCode: string): Promise<Insight[]> => {
    try {
        const languageName = getLanguageName(languageCode);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `You are an environmental news curator. Generate 3 diverse and engaging insights related to plastic waste, recycling, or sustainability. For each, provide an ID (e.g., news_1), a type ('news', 'tip', or 'community'), a short, compelling title, and a one-sentence description. Respond ONLY with a valid JSON array matching the provided schema. The entire response must be in ${languageName}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['news', 'tip', 'community'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["id", "type", "title", "description"]
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        if (Array.isArray(json) && json.length > 0) {
            return json as Insight[];
        }
        return FALLBACK_INSIGHTS;
    } catch (error) {
        console.warn("Could not fetch dynamic insights from Gemini API, using curated insights:", error);
        return FALLBACK_INSIGHTS;
    }
};

export const getInsightDetails = async (insight: Insight, languageCode: string): Promise<InsightDetails | null> => {
    try {
        const languageName = getLanguageName(languageCode);
        const { title, type } = insight;
        const prompt = `You are an expert content creator specializing in environmental topics. Elaborate on the insight titled "${title}". The insight is of type "${type}". 
        
        Instructions:
        1.  Provide the original title.
        2.  Write a concise, engaging summary (2-3 sentences).
        3.  List 3-4 key takeaways or bullet points.
        4.  If the type is 'news' or 'community', create a plausible, brief timeline of 2-3 key events related to the topic.
        5.  If the type is 'community', include a 'progress' field with a number between 0 and 100.
        
        Respond ONLY with a valid JSON object matching the schema. The entire response must be in ${languageName}.`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        timeline: { 
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    date: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                },
                                required: ["date", "description"]
                            },
                        },
                        progress: { type: Type.NUMBER }
                    },
                    required: ["title", "summary", "keyPoints"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as InsightDetails;
    } catch (error) {
        console.warn("Could not fetch insight details, using fallback:", error);
        if (FALLBACK_DETAILS[insight.id]) {
            return FALLBACK_DETAILS[insight.id];
        }
        return {
            title: insight.title,
            summary: insight.description,
            keyPoints: [
                'Prioritize proper recycling and separation at the consumer source.',
                'Support community-led cleanups and circular material alternatives.',
                'Reduce single-use plastic consumption whenever possible.'
            ]
        };
    }
};

export const getFunFact = async (plasticType: string, languageCode: string): Promise<string> => {
    try {
        const languageName = getLanguageName(languageCode);
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Tell me a surprising or interesting fun fact about ${plasticType} plastic. Keep it to one or two sentences. Start it with "Did you know...". The response must be in ${languageName}.`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting fun fact:", error);
        return "Did you know... the world produces over 380 million tons of plastic every year, and about half of that is for single-use purposes?"; // A fallback fact
    }
};

export const getSustainableAlternatives = async (plasticType: string, languageCode: string): Promise<MaterialDatabaseItem[]> => {
    try {
        const languageName = getLanguageName(languageCode);
        const prompt = `You are a materials science expert. For the plastic type '${plasticType}', generate a list of 2-3 innovative, biodegradable, or sustainable material alternatives. For each material, provide an ID, name, a brief description, key specifications (as property-value pairs), 2-3 example suppliers (can be fictional companies like 'BioSynth Solutions'), a lifecycle analysis (biodegradability, carbon footprint, recycling info), and a 'suitability' field explaining why this material is a good alternative for common applications of '${plasticType}'. Respond ONLY with a valid JSON array matching the provided schema. The entire response must be in ${languageName}.`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            suitability: { type: Type.STRING },
                            specs: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        property: { type: Type.STRING },
                                        value: { type: Type.STRING }
                                    },
                                    required: ["property", "value"]
                                }
                            },
                            suppliers: { type: Type.ARRAY, items: { type: Type.STRING } },
                            lifecycle: {
                                type: Type.OBJECT,
                                properties: {
                                    biodegradability: { type: Type.STRING },
                                    carbonFootprint: { type: Type.STRING },
                                    recyclingInfo: { type: Type.STRING }
                                },
                                required: ["biodegradability", "carbonFootprint", "recyclingInfo"]
                            }
                        },
                        required: ["id", "name", "description", "suitability", "specs", "suppliers", "lifecycle"]
                    }
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as MaterialDatabaseItem[];
    } catch (error) {
        console.error("Error getting material alternatives:", error);
        return [];
    }
};

export const getRecyclingRules = async (plasticType: string, location: string, languageCode: string): Promise<RecyclingRules | null> => {
    try {
        const languageName = getLanguageName(languageCode);
        const prompt = `You are a recycling regulations expert. For "${plasticType}" plastic in "${location}", provide local recycling rules.
        
        Instructions:
        1.  State if it is generally recyclable there (isRecyclable: boolean).
        2.  Provide 3-4 clear, actionable instructions for how to recycle it.
        3.  If applicable, add 1-2 important notes (e.g., "Caps must be removed").
        
        Respond ONLY with a valid JSON object matching the schema. The response must be in ${languageName}.`;

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        plasticType: { type: Type.STRING },
                        isRecyclable: { type: Type.BOOLEAN },
                        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        notes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["location", "plasticType", "isRecyclable", "instructions"]
                }
            }
        });
        const json = JSON.parse(response.text);
        return json as RecyclingRules;
    } catch (error) {
        console.error("Error getting recycling rules:", error);
        return null;
    }
};

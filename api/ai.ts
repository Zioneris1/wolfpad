// Located at api/ai.ts
// This is a Vercel Serverless Function that acts as a secure backend.

import { GoogleGenAI, Type } from "@google/genai";
import type { Task, GoalWithProgress, AppContextData, AssistantResponse, SuggestedTask, DevelopmentPlan, DevelopmentResource, SuggestedTaskValues } from '../types';

// This function runs on the server, so we can safely use process.env
if (!process.env.API_KEY) {
    throw new Error("API_KEY is not set in environment variables.");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// Helper to get a descriptive error message
const getAiErrorMessage = (error: unknown, action: string): string => {
    console.error(`Error in AI Action '${action}':`, error);
    if (error instanceof Error) return error.message;
    return `An unknown error occurred while processing ${action}.`;
};

// Define all our AI functions here, almost identical to the old lib/ai.ts
const actions: { [key: string]: (params: any) => Promise<any> } = {
    getTaskSuggestions: async ({ taskName }: { taskName: string }): Promise<SuggestedTaskValues> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the task name "${taskName}", generate a concise, one-paragraph description (max 3 sentences), estimate its effort (1-5), impact (1-10), and suggest 3-5 relevant single-word tags.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        effort: { type: Type.INTEGER },
                        impact: { type: Type.INTEGER },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                }
            }
        });
        const suggestions = JSON.parse(response.text.trim());
        suggestions.effort = Math.max(1, Math.min(5, suggestions.effort || 3));
        suggestions.impact = Math.max(1, Math.min(10, suggestions.impact || 5));
        return suggestions;
    },
    
    getTaskBreakdownForGoal: async ({ goalName, goalDescription }: { goalName: string, goalDescription: string }): Promise<SuggestedTask[]> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Break down the high-level goal "${goalName}" (Description: "${goalDescription}") into 5-7 actionable, smaller tasks. For each task, provide a name, a concise one-sentence description, and estimate its effort (1-5) and impact (1-10) relative to achieving the main goal.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tasks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING }, description: { type: Type.STRING },
                                    effort: { type: Type.INTEGER }, impact: { type: Type.INTEGER }
                                },
                            }
                        }
                    },
                }
            }
        });
        const result = JSON.parse(response.text.trim());
        return (result.tasks || []).map((task: SuggestedTask) => ({
            ...task,
            effort: Math.max(1, Math.min(5, task.effort || 3)),
            impact: Math.max(1, Math.min(10, task.impact || 5)),
        }));
    },

    getDevelopmentPlan: async ({ goal, bookCount, channelCount, podcastCount }: { goal: string; bookCount: number; channelCount: number; podcastCount: number; }): Promise<DevelopmentPlan> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a personal development plan for the goal: "${goal}". Provide a list of the top ${bookCount} books (with authors), ${channelCount} YouTube channels, and ${podcastCount} podcasts to achieve this goal.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        books: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } } },
                        youtubeChannels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } } },
                        podcasts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } } },
                    },
                }
            }
        });
        return JSON.parse(response.text.trim());
    },
    
    // Fix: Add missing getAlternativeResource function to handle requests from the frontend.
    getAlternativeResource: async ({ goal, resourceToReplace }: { goal: string, resourceToReplace: string }): Promise<DevelopmentResource> => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Given the learning goal "${goal}", suggest an alternative resource for "${resourceToReplace}". Provide a title and the author/channel name.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        authorOrChannel: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text.trim());
    },
    
     getTaskPrioritization: async ({ tasks }: { tasks: Task[] }): Promise<string> => {
        const today = new Date().toISOString().split('T')[0];
        const taskData = tasks.map(t => `- ${t.name} (Impact: ${t.impact}/10, Due: ${t.due_date || 'None'})`).join('\\n');
        const prompt = `Given the following list of pending tasks and today's date (${today}), identify the top 3 tasks to focus on. Provide a very concise, one-sentence justification for each, considering both impact and urgency (due dates). Keep the total response under 75 words. The output must be a simple numbered list in plain text. Do not use any markdown formatting.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        return response.text;
    },

    generateContent: async ({ prompt }: { prompt: string }): Promise<string> => {
        const finalPrompt = `Please provide a concise, to-the-point response in plain text. Absolutely no markdown formatting. Keep the total response brief. User prompt: "${prompt}"`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: finalPrompt });
        return response.text;
    },

    getGoalStrategy: async ({ goal }: { goal: GoalWithProgress }): Promise<string> => {
        const prompt = `Analyze the goal: "${goal.name}" (Progress: ${goal.progress}%). Suggest 3-4 key strategic steps to achieve this. Provide a brief, one-sentence explanation for each. Total response under 100 words. Output as a simple numbered list in plain text, with no markdown.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        return response.text;
    },
    
    getAiAssistantResponse: async ({ query, context }: { query: string, context: AppContextData }): Promise<AssistantResponse> => {
         const systemInstruction = `You are Wolfie, an AI assistant for the WolfPad app. Your mission is to apply the 80/20 principle to help the user focus. You MUST consider the user's current view ('${context.currentView}') to make responses relevant. You MUST respond with a JSON object with 'responseType' and 'text'. For navigation, 'responseType' is 'navigation_suggestion' and you must include a 'view' ID and confirmation 'text'. Valid views: 'dashboard', 'goals', 'weekly', 'schedule', 'financials', 'personalDevelopment', 'analytics', 'agents'.`;
         const contextString = `Data: - VIEW: ${context.currentView} - TASKS: ${JSON.stringify(context.tasks.map(t => ({ name: t.name, due: t.due_date, impact: t.impact, completed: t.completed, goalId: t.goal_id })))} - GOALS: ${JSON.stringify(context.goals.map(g => ({ name: g.name, progress: g.progress })))}`;
         const prompt = `${contextString}\\n\\nUser query: "${query}"`;

         const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: { parts: [{ text: prompt }] },
             config: {
                 systemInstruction,
                 responseMimeType: "application/json",
                 responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         responseType: { type: Type.STRING, enum: ['answer', 'navigation_suggestion'] },
                         text: { type: Type.STRING },
                         view: { type: Type.STRING, nullable: true }
                     },
                     required: ['responseType', 'text']
                 }
             }
         });
         return JSON.parse(response.text.trim());
    },
    // Add other AI functions here following the same pattern...
};


// This is the main Vercel Serverless Function handler
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { action, params } = req.body;

        if (typeof action !== 'string' || !actions[action]) {
            return res.status(400).json({ error: 'Invalid or missing action' });
        }

        const result = await actions[action](params);
        return res.status(200).json(result);

    } catch (error) {
        const errorMessage = getAiErrorMessage(error, req.body.action || 'unknown');
        return res.status(500).json({ error: errorMessage });
    }
}
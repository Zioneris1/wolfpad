import { GoogleGenAI, Type } from "@google/genai";
import type { Task, GoalWithProgress, View, AppContextData, AssistantResponse } from '../types';

// Fix: Per coding guidelines, the API key must be obtained from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });


const getAiErrorMessage = (error: unknown, action: string): string => {
    console.error(`Error trying to ${action}:`, error);

    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('rpc failed') || errorMessage.includes('unavailable')) {
            return "The AI service seems to be temporarily unavailable. Please try again in a few moments.";
        }
        if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
            return "There was a problem processing this request with the AI.";
        }
        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            return "The AI service is currently experiencing high demand. Please try again later.";
        }
    }
    
    return "An unexpected error occurred. Please check your connection and try again.";
};

export interface SuggestedTaskValues {
    description: string;
    effort: number; // 1-5
    impact: number; // 1-10
    tags: string[];
}

export interface SuggestedTask {
    name: string;
    description: string;
    effort: number;
    impact: number;
}

export interface DevelopmentResource {
    title: string;
    authorOrChannel: string;
}

export interface DevelopmentPlan {
    books: DevelopmentResource[];
    youtubeChannels: DevelopmentResource[];
    podcasts: DevelopmentResource[];
}


/**
 * Gets AI-powered suggestions for a task's details.
 */
export const getTaskSuggestions = async (taskName: string): Promise<SuggestedTaskValues> => {
    const model = "gemini-2.5-flash";
    const prompt = `Based on the task name "${taskName}", generate a concise, one-paragraph description (max 3 sentences), estimate its effort (1-5), impact (1-10), and suggest 3-5 relevant single-word tags.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        effort: { type: Type.INTEGER },
                        impact: { type: Type.INTEGER },
                        tags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                }
            }
        });

        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText);

        // Clamp values to be within expected range
        suggestions.effort = Math.max(1, Math.min(5, suggestions.effort || 3));
        suggestions.impact = Math.max(1, Math.min(10, suggestions.impact || 5));
        
        return suggestions;

    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'get task suggestions'));
    }
};


/**
 * Gets more tag suggestions based on a task name and description.
 */
export const getMoreTagSuggestions = async (taskName: string, description: string): Promise<string[]> => {
    const model = "gemini-2.5-flash";
    const prompt = `Given the task "${taskName}" with description "${description}", suggest 5 additional, relevant, single-word tags.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tags: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result.tags || [];

    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'get more tag suggestions'));
    }
};

/**
 * Breaks down a goal into a list of suggested tasks.
 */
export const getTaskBreakdownForGoal = async (goalName: string, goalDescription: string): Promise<SuggestedTask[]> => {
    const model = "gemini-2.5-flash";
    const prompt = `Break down the high-level goal "${goalName}" (Description: "${goalDescription}") into 5-7 actionable, smaller tasks. For each task, provide a name, a concise one-sentence description, and estimate its effort (1-5) and impact (1-10) relative to achieving the main goal.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
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
                                    name: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    effort: { type: Type.INTEGER },
                                    impact: { type: Type.INTEGER }
                                },
                            }
                        }
                    },
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        // Clamp values to be within expected range
        return (result.tasks || []).map((task: SuggestedTask) => ({
            ...task,
            effort: Math.max(1, Math.min(5, task.effort || 3)),
            impact: Math.max(1, Math.min(10, task.impact || 5)),
        }));

    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'get a task breakdown for the goal'));
    }
};

/**
 * Generates a personal development plan based on a goal.
 */
export const getDevelopmentPlan = async (goal: string, bookCount: number, channelCount: number, podcastCount: number): Promise<DevelopmentPlan> => {
    const model = "gemini-2.5-flash";
    const prompt = `Create a personal development plan for the goal: "${goal}". Provide a list of the top ${bookCount} books (with authors), ${channelCount} YouTube channels, and ${podcastCount} podcasts to achieve this goal.`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        books: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } }
                        },
                        youtubeChannels: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } }
                        },
                        podcasts: {
                            type: Type.ARRAY,
                            items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, authorOrChannel: { type: Type.STRING } } }
                        },
                    },
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DevelopmentPlan;
    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'generate a development plan'));
    }
};

/**
 * Suggests an alternative resource for a personal development plan.
 */
export const getAlternativeResource = async (goal: string, resourceToReplace: string): Promise<DevelopmentResource> => {
    const model = "gemini-2.5-flash";
    const prompt = `For a personal development plan focused on "${goal}", suggest one alternative resource to replace "${resourceToReplace}". Provide the title and the author or channel name.`;

    try {
         const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        authorOrChannel: { type: Type.STRING },
                    },
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DevelopmentResource;
    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'get an alternative resource'));
    }
};

/**
 * Analyzes pending tasks and suggests the top 3 priorities.
 */
export const getTaskPrioritization = async (tasks: Task[]): Promise<string> => {
    const model = "gemini-2.5-flash";
    const today = new Date().toISOString().split('T')[0];
    // Fix: Changed dueDate to due_date to match Task type.
    const taskData = tasks.map(t => `- ${t.name} (Impact: ${t.impact}/10, Due: ${t.due_date || 'None'})`).join('\n');
    const prompt = `Given the following list of pending tasks and today's date (${today}), identify the top 3 tasks to focus on. Provide a very concise, one-sentence justification for each, considering both impact and urgency (due dates). Keep the total response under 75 words. The output must be a simple numbered list in plain text. Do not use any markdown formatting such as asterisks, bullet points, or bolding.
    
    Tasks:
    ${taskData}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
        });
        return response.text;
    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'prioritize tasks'));
    }
};

/**
 * Generates content based on a user-provided prompt.
 */
export const generateContent = async (prompt: string): Promise<string> => {
    const model = "gemini-2.5-flash";
    const finalPrompt = `Please provide a concise, to-the-point response in plain text. Absolutely no markdown formatting (like asterisks for lists, bolding with **, or headers with #) should be used. The output should be clean text. Keep the total response brief unless the user asks for length.

User prompt: "${prompt}"`;
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: finalPrompt }] },
        });
        return response.text;
    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'generate content'));
    }
};


/**
 * Provides strategic advice for a given goal.
 */
export const getGoalStrategy = async (goal: GoalWithProgress): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `Analyze the following goal and provide high-level strategic advice.
    
    Goal: "${goal.name}"
    Description: "${goal.description}"
    Current Progress: ${goal.progress}%
    
    Based on this, suggest 3-4 key strategic steps or areas of focus to help achieve this goal. Provide a very brief, one-sentence explanation for each point. Keep the total response under 100 words. The output must be a simple numbered list in plain text. Do not use any markdown formatting such as asterisks, bullet points, or bolding.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
        });
        return response.text;
    } catch (error) {
        throw new Error(getAiErrorMessage(error, 'get a goal strategy'));
    }
};

/**
 * Powers the main AI assistant chat.
 */
export const getAiAssistantResponse = async (query: string, context: AppContextData): Promise<AssistantResponse> => {
    const model = "gemini-2.5-flash";
    
    const systemInstruction = `You are Wolfie, the intelligent AI assistant for the WolfPad productivity app.
Your core mission is to help the user achieve peak performance by applying the 80/20 principle (the Pareto principle), focusing on the vital few actions that yield the most significant results.
You have been provided with a real-time snapshot of the user's current data, including the view they are currently on.
**VERY IMPORTANT**: You MUST consider the user's current view ('${context.currentView}') to make your responses more relevant. For example, if they are on the 'goals' view and ask a general question like "what should I focus on?", your answer should prioritize goal-related tasks. If they are on the 'financials' view, focus on financial data.

Your capabilities:
1.  **Context-Aware Data Analysis**: You can answer specific questions about the user's tasks, goals, schedule, and financial transactions, prioritizing information relevant to their current view.
2.  **Strategic Advice**: When asked for advice (e.g., "What should I do today?"), you must analyze the provided data to identify high-impact, high-leverage activities. Consider due dates, impact/effort scores, goal alignment, and the user's current view.
3.  **App Navigation**: You can SUGGEST navigating the user to different sections of the app. To do this, you must respond with a JSON object where 'responseType' is 'navigation_suggestion' and 'view' is one of the valid view IDs. The 'text' should be a question asking for confirmation, e.g., "I can take you to your schedule. Shall I proceed?"
4.  **Conversational Interaction**: You must be concise, helpful, and maintain a motivational and supportive tone.

**Response Format**:
You MUST respond with a JSON object that strictly follows this schema. Do not add any extra text or markdown before or after the JSON.
- For a conversational answer or advice, use: { "responseType": "answer", "text": "Your helpful response here." }
- For suggesting navigation, use: { "responseType": "navigation_suggestion", "view": "view_id", "text": "Confirmation question, e.g., 'I can take you to your goals. Would you like to go there now?'" }

Valid 'view' IDs are: 'dashboard', 'goals', 'weekly', 'schedule', 'financials', 'personalDevelopment', 'analytics', 'agents'.
`;

    const contextString = `
Here is the user's current data:
- CURRENT VIEW: ${context.currentView}
- TASKS: ${JSON.stringify(context.tasks.map(t => ({ name: t.name, due: t.due_date, impact: t.impact, effort: t.effort, completed: t.completed, goalId: t.goal_id })))}
- GOALS: ${JSON.stringify(context.goals.map(g => ({ id: g.id, name: g.name, progress: g.progress })))}
- SCHEDULE (Today's Routines): ${JSON.stringify(context.scheduleBlocks.filter(b => b.day_of_week === new Date().getDay()))}
- RECENT TRANSACTIONS (last 5): ${JSON.stringify(context.transactions.slice(0, 5).map(t => ({ desc: t.description, amount: t.amount, category: t.category })))}
`;

    const prompt = `${contextString}\n\nUser query: "${query}"`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        responseType: { type: Type.STRING, enum: ['answer', 'navigation_suggestion'] },
                        text: { type: Type.STRING },
                        view: { type: Type.STRING, enum: ['dashboard', 'goals', 'weekly', 'schedule', 'financials', 'personalDevelopment', 'analytics', 'agents'], nullable: true }
                    },
                    required: ['responseType', 'text']
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        const errorMessage = getAiErrorMessage(error, 'get AI assistant response');
        return {
            responseType: 'answer',
            text: `I'm sorry, I've encountered an issue. ${errorMessage}`,
        };
    }
};
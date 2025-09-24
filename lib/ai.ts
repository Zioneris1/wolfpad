import type { Task, GoalWithProgress, AppContextData, AssistantResponse, SuggestedTaskValues, SuggestedTask, DevelopmentPlan, DevelopmentResource } from '../types';

// This is a generic helper function to call our new secure backend API.
async function callAiApi<T>(action: string, params: Record<string, any>): Promise<T> {
    try {
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, params })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API call for action '${action}' failed.`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error in callAiApi for action '${action}':`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while contacting the AI service.');
    }
}


export const getTaskSuggestions = (taskName: string): Promise<SuggestedTaskValues> => {
    return callAiApi('getTaskSuggestions', { taskName });
};

export const getMoreTagSuggestions = (taskName: string, description: string): Promise<string[]> => {
    return callAiApi('getMoreTagSuggestions', { taskName, description });
};

export const getTaskBreakdownForGoal = (goalName: string, goalDescription: string): Promise<SuggestedTask[]> => {
    return callAiApi('getTaskBreakdownForGoal', { goalName, goalDescription });
};

export const getDevelopmentPlan = (goal: string, bookCount: number, channelCount: number, podcastCount: number): Promise<DevelopmentPlan> => {
    return callAiApi('getDevelopmentPlan', { goal, bookCount, channelCount, podcastCount });
};

export const getAlternativeResource = (goal: string, resourceToReplace: string): Promise<DevelopmentResource> => {
    return callAiApi('getAlternativeResource', { goal, resourceToReplace });
};

export const getTaskPrioritization = (tasks: Task[]): Promise<string> => {
    return callAiApi('getTaskPrioritization', { tasks });
};

export const generateContent = (prompt: string): Promise<string> => {
    return callAiApi('generateContent', { prompt });
};

export const getGoalStrategy = (goal: GoalWithProgress): Promise<string> => {
    return callAiApi('getGoalStrategy', { goal });
};

export const getAiAssistantResponse = async (query: string, context: AppContextData): Promise<AssistantResponse> => {
    try {
        return await callAiApi('getAiAssistantResponse', { query, context });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        return {
            responseType: 'answer',
            text: `I'm sorry, I've encountered an issue. ${errorMessage}`,
        };
    }
};
import { apiClient } from "@/lib/api";

export interface AIModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
}

export interface AISuggestionResult {
  suggestedText?: string;
  suggestedBio?: string;
}

export interface AISmartRepliesResult {
  suggestions: string[];
}

const AIService = {
  /**
   * Generate smart reply suggestions for a received message.
   * @param message - The message to reply to
   * @param context - Optional last few messages for tone context (alternating them/you)
   */
  async suggestReplies(message: string, context: string[] = []): Promise<string[]> {
    const response = await apiClient.post<AISmartRepliesResult>('/ai/suggest-replies', {
      message,
      context,
    });
    if (response.success && response.data?.suggestions) {
      return response.data.suggestions;
    }
    return [];
  },

  /**
   * Request post enhancement from AI
   */
  async suggestPostEnhancement(content: string): Promise<string> {
    const response = await apiClient.post<AISuggestionResult>('/ai/suggest-enhancement', { content });
    if (response.success && response.data?.suggestedText) {
      return response.data.suggestedText;
    }
    throw new Error(response.message || "Failed to get AI suggestion");
  },

  /**
   * Request bio suggestion from AI
   */
  async suggestBio(name: string, displayName: string, currentBio: string): Promise<string> {
    const response = await apiClient.post<AISuggestionResult>('/ai/suggest-bio', { 
      name, 
      display_name: displayName, 
      current_bio: currentBio 
    });
    if (response.success && response.data?.suggestedBio) {
      return response.data.suggestedBio;
    }
    throw new Error(response.message || "Failed to get bio suggestion");
  },

  /**
   * Check content moderation manually
   */
  async moderateContent(text: string): Promise<AIModerationResult> {
    const response = await apiClient.post<AIModerationResult>('/ai/moderate', { text });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || "Moderation check failed");
  },

  /**
   * Analyze image (Vision)
   * Note: This calls the AI microservice via the backend proxy (once implemented)
   * or directly if configured. For now, we'll assume a proxy route.
   */
  async analyzeImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    // We'll need a backend route for this. For now using placeholder logic.
    const response = await apiClient.upload<{ description: string }>('/ai/vision/analyze', formData);
    if (response.success && response.data?.description) {
      return response.data.description;
    }
    throw new Error(response.message || "Image analysis failed");
  }
};

export default AIService;

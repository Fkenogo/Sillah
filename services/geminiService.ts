
// Fix: Use correct imports from types.ts and ensure Type is imported from @google/genai
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Post, EngagementPrompt, MatchRecommendation, IndividualSummary, CircleSummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Usage tracking helper for 6.5
const logAiUsage = (operation: string, tokens: number) => {
  console.debug(`[AI Usage] Op: ${operation} | Est. Tokens: ${tokens} | Model: Gemini-3`);
};

export const geminiService = {
  /**
   * 6.2 Matching Algorithm
   */
  async getMatchingRecommendations(user: UserProfile, candidates: UserProfile[]): Promise<MatchRecommendation[]> {
    const prompt = `
      You are Siilah's Spiritual Community Architect. 
      Target User: ${user.name} (Faith: ${user.faith_stage}, Rhythm: ${user.activity_preference})
      
      Candidates:
      ${candidates.map(c => `- ${c.name}: Faith(${c.faith_stage}), Stages(${c.life_stages.join(',')}), Focus(${c.prayer_focus.join(',')}), Rhythm(${c.activity_preference})`).join('\n')}

      Task: Create 2 triad recommendations based on these compatibility weights:
      - Activity Rhythm (30%): CRITICAL match. Daily vs Weekly.
      - Life Stages (20%): Shared parenting, career, etc.
      - Prayer Focus (20%): Shared focus areas.
      - Faith Stage (15%): Compatibility between stages (e.g., Growing + Established).
      - Sharing Comfort (10%): Match small-group vs 1:1.
      - Timezone/Availability (5%): Morning vs Evening.

      Respond with structured JSON recommendations.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              candidateNames: { type: Type.ARRAY, items: { type: Type.STRING } },
              groupType: { type: Type.STRING },
              overallScore: { type: Type.NUMBER },
              pillars: {
                type: Type.OBJECT,
                properties: {
                  spiritualSync: { type: Type.NUMBER },
                  rhythmMatch: { type: Type.NUMBER },
                  vulnerabilityBalance: { type: Type.NUMBER }
                }
              },
              reasoning: { type: Type.STRING },
              commonGround: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["candidateNames", "groupType", "overallScore", "pillars", "reasoning", "commonGround"]
          }
        }
      }
    });

    logAiUsage("Matching", 800);
    return JSON.parse(response.text || '[]');
  },

  /**
   * Semantic Search for Community Discovery
   */
  async searchCommunity(query: string, data: { people: UserProfile[], circles: any[], themes: string[] }): Promise<any> {
    const prompt = `
      You are Siilah's Community Guide. A user is searching for: "${query}"
      
      Based on the query, identify relevant:
      1. People (from provided list: ${data.people.map(p => p.name).join(', ')})
      2. Themes (from list: ${data.themes.join(', ')})
      3. Potential Circle types (e.g., "Healing", "Career", "Parenting")
      
      Explain WHY these matches are spiritually relevant to the query.
      Respond in JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            peopleMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
            themeMatch: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING }
          }
        }
      }
    });

    logAiUsage("Search", 500);
    return JSON.parse(response.text || '{}');
  },

  /**
   * AI Post Summary for long posts (> 500 chars)
   */
  async generatePostSummary(content: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very brief (max 15 words) summary of the following prayer request/spiritual reflection to help community members grasp the core need quickly: "${content}"`,
    });
    return response.text?.trim() || "";
  },

  /**
   * 6.3 Summary Generation (Weekly Circle)
   */
  async generateCircleSummary(circleId: string, circleName: string, posts: Post[]): Promise<CircleSummary> {
    const postsText = posts.map(p => `User ${p.user.name}: ${p.content_text}`).join('\n');
    
    const prompt = `
      Analyze this week's activity in the circle "${circleName}".
      Posts:
      ${postsText}

      Task:
      1. Extract up to 5 main themes (family, faith growth, etc.) with count and sentiment.
      2. Identify ONE specific "Key Moment" that shows deep connection.
      3. Generate a celebration message (e.g., "4 weeks of consistency!").
      4. Suggest a fresh open-ended prompt for next week (10-15 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  count: { type: Type.NUMBER },
                  sentiment: { type: Type.STRING }
                }
              }
            },
            keyMoment: { type: Type.STRING },
            celebration: { type: Type.STRING },
            nextPrompt: { type: Type.STRING }
          },
          required: ["themes", "keyMoment", "celebration", "nextPrompt"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    logAiUsage("WeeklySummary", 1200);

    return {
      summary_id: Math.random().toString(),
      summary_type: 'weekly_circle',
      period_start: new Date(Date.now() - 7 * 86400000).toISOString(),
      period_end: new Date().toISOString(),
      highlights: {
        prayers_shared: posts.length,
        responses: posts.reduce((acc, p) => acc + (p.response_count || 0), 0),
        praying_now: posts.filter(p => (p.praying_now?.length || 0) > 0).length
      },
      themes: data.themes,
      key_moment: data.keyMoment,
      next_prompt: data.nextPrompt,
      celebration: data.celebration,
      generated_at: new Date().toISOString()
    };
  },

  /**
   * AI Spiritual Partner Response
   */
  async getAiPartnerResponse(userProfile: UserProfile, userPost: Post): Promise<string> {
    const prompt = `
      You are Siilah, an AI spiritual guide and prayer partner for a Christian community. 
      User Profile: ${userProfile.name}, currently in the "${userProfile.faith_stage}" stage of faith.
      Focus areas: ${userProfile.prayer_focus.join(', ')}.
      
      The user just shared a ${userPost.post_type}: "${userPost.content_text}".
      
      Task: Respond as a loving, wise, and encouraging spiritual companion. 
      - If it's a prayer request: Offer a short, specific prayer for them.
      - If it's a testimony: Celebrate with them and acknowledge God's faithfulness.
      - If it's a struggle: Offer empathy, a relevant spiritual truth, and comfort.
      - If it's gratitude: Join in their thanksgiving.
      
      Tone: Warm, humble, text-first, Christian-leaning, but never preachy. Keep it under 60 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    logAiUsage("AiPartnerResponse", 400);
    return response.text?.trim() || "I am holding this in my heart with you.";
  },

  async getEngagementPrompt(circleName: string, recentPosts: Post[], members: string[]): Promise<EngagementPrompt> {
    const context = recentPosts.length > 0 
      ? `Recent activity: ${recentPosts.slice(-3).map(p => p.content_text).join(' | ')}`
      : "New circle.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a fresh, 10-15 word question for "${circleName}". Context: ${context}. Avoid repeat themes. Focus on reflection.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            type: { type: Type.STRING },
            actionLabel: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ["text", "type", "actionLabel", "context"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async getDailyEncouragement(user: UserProfile) {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a warm morning encouragement (<20 words) for ${user.name}. Faith: ${user.faith_stage}. Focus: ${user.prayer_focus.join(',')}.`
    });
    return response.text || '';
  },

  async getIndividualProgress(user: UserProfile, posts: Post[]): Promise<IndividualSummary> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze spiritual growth for ${user.name}. Shares: ${posts.filter(p => p.user.user_id === user.user_id).map(p => p.content_text).join(' | ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            connectedCircles: { type: Type.ARRAY, items: { type: Type.STRING } },
            metrics: {
              type: Type.OBJECT,
              properties: {
                shared: { type: Type.NUMBER },
                encouraged: { type: Type.NUMBER },
                prayed: { type: Type.NUMBER },
                streak: { type: Type.NUMBER }
              }
            },
            personalThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
            growthMoment: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }
};

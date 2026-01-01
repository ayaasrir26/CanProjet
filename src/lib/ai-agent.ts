
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";
import { players } from "@/data/players";

// Define the available tools for the agent
export const TOOLS = {
  NAVIGATE: "navigate",
  GET_PAGE_CONTENT: "get_page_content",
} as const;

export type ToolType = (typeof TOOLS)[keyof typeof TOOLS];

interface ToolCall {
  tool: ToolType;
  args: any;
}

export interface AgentResponse {
  text: string;
  toolCall?: ToolCall;
}

export class AIAgent {
  private model: any;
  private chat: any;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash (available in this environment)
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Initialize chat with system instruction
    this.chat = this.model.startChat({
      history: [
        {
          role: "user",
          parts: [{
            text: `You are an intelligent Agent capable of controlling this web application.
          
          You have access to the following tools:
          1. navigate(path: string): Change the current route. Path should start with /. Available routes: /, /auth, /groups, /bracket, /admin.
          2. get_page_content(): Read the text content of the current page.

          When the user asks you to do something that requires a tool, you must reply in a specific JSON format ONLY (markdown code block).
          
          Format for tool calls:
          \`\`\`json
          {
            "tool": "navigate",
            "args": { "path": "/groups" }
          }
          \`\`\`

          If no tool is needed, just reply normally.
          Always be helpful, concise, and professional.` }]
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am ready to assist you seamlessly with navigation and information." }]
        }
      ],
    });
  }

  async getTournamentContext(): Promise<string> {
    try {
      const { data: matches } = await supabase
        .from('matches')
        .select(`
          match_date,
          stage,
          stadium,
          home_team:teams!matches_home_team_id_fkey(name),
          away_team:teams!matches_away_team_id_fkey(name)
        `)
        .order('match_date', { ascending: true });

      let scheduleText = "";

      if (!matches || matches.length === 0) {
        // Fallback schedule if DB is empty
        scheduleText = `
- Match d'ouverture: Maroc vs Afrique du Sud le 21 Décembre 2025 à 20:00 au Complexe Mohammed V
- Côte d'Ivoire vs Nigeria le 22 Décembre 2025 à 18:00 au Stade Moulay Abdellah
- Sénégal vs Égypte le 23 Décembre 2025 à 21:00 au Grand Stade de Tanger
- Algérie vs Cameroun le 24 Décembre 2025 à 19:00 au Grand Stade de Marrakech
        `.trim();
      } else {
        scheduleText = matches.map((m: any) => {
          const date = new Date(m.match_date).toLocaleDateString('fr-FR', {
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
          });
          return `- ${m.stage}: ${m.home_team?.name} vs ${m.away_team?.name} le ${date} à ${m.stadium}`;
        }).join('\n');
      }

      return `\n\n[Calendrier des Matchs CAN 2025]:\n${scheduleText}`;
    } catch (error) {
      console.error("Error fetching tournament context:", error);
      return "";
    }
  }

  getPlayersContext(): string {
    // Summarize players by team
    const playersByTeam: Record<string, string[]> = {};
    players.forEach(p => {
      if (!playersByTeam[p.teamCode]) {
        playersByTeam[p.teamCode] = [];
      }
      playersByTeam[p.teamCode].push(`${p.name} (${p.position})`);
    });

    let context = "\n[Liste des Joueurs Clés par Équipe]:\n";
    for (const [team, playerList] of Object.entries(playersByTeam)) {
      context += `- ${team}: ${playerList.join(", ")}\n`;
    }
    return context;
  }

  async sendMessage(message: string, context?: string): Promise<AgentResponse> {
    try {
      let prompt = message;

      // Fetch tournament data
      const tournamentContext = await this.getTournamentContext();
      const playersContext = this.getPlayersContext();

      if (context || tournamentContext || playersContext) {
        prompt += `\n\n[Contexte Actuel]: ${context || ''}`;
        prompt += tournamentContext;
        prompt += playersContext;
      }

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const text = response.text();

      // Check for JSON tool call in the response
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch && jsonMatch[1]) {
        try {
          const toolCall = JSON.parse(jsonMatch[1]);
          // Return the text BEFORE the JSON if any, or just a "Executing..." message if empty
          const cleanText = text.replace(/```json[\s\S]*?```/, "").trim() || "I'm on it.";
          return { text: cleanText, toolCall };
        } catch (e) {
          console.error("Failed to parse tool call:", e);
        }
      }

      return { text };
    } catch (error: any) {
      console.error("AI Agent Error:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        name: error?.name
      });

      // Provide more specific error messages based on error type
      if (error?.message?.includes("API key")) {
        return { text: "❌ Invalid API key. Please check your Gemini API key in settings." };
      } else if (error?.status === 429 || error?.message?.includes("quota") || error?.message?.includes("rate limit")) {
        return { text: "⏳ Rate limit reached. Please wait a moment and try again." };
      } else if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
        return { text: "🌐 Network error. Please check your internet connection." };
      } else {
        return { text: `⚠️ AI Error: ${error?.message || "Unknown error occurred"}. Check console for details.` };
      }
    }
  }
}

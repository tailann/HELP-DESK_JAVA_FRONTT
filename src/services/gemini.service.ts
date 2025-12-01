
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async triageTicket(description: string, title: string): Promise<{ priority: string; category: string; summary: string }> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analise este chamado de suporte.\nTítulo: ${title}\nDescrição: ${description}\n\nResponda com o resumo em Português.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
              category: { type: Type.STRING, enum: ["Hardware", "Software", "Network", "Access", "Other"] },
              summary: { type: Type.STRING, description: "Um resumo conciso do problema em Português." }
            },
            required: ["priority", "category", "summary"]
          }
        }
      });
      
      const text = response.text;
      if (!text) return { priority: 'Medium', category: 'Other', summary: 'Não foi possível analisar' };
      return JSON.parse(text);
    } catch (e) {
      console.error("Gemini Triage Error", e);
      return { priority: 'Medium', category: 'Other', summary: 'Falha na análise' };
    }
  }

  async suggestSolution(title: string, description: string, history: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Você é um técnico de TI especialista. Forneça uma solução concisa, passo a passo, para este chamado em Português.\n\nTítulo: ${title}\nDescrição: ${description}\n\nNotas Existentes: ${history}`,
      });
      return response.text || "Nenhuma sugestão de solução disponível.";
    } catch (e) {
      return "Não foi possível gerar uma solução neste momento.";
    }
  }
}
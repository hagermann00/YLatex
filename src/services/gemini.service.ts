
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Book, Chapter, Comic, CaseStudy, Chart } from '../models/book-content.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is injected via environment variables.
    // Do not hardcode or expose the key in the frontend.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY environment variable not set.');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateBookContent(topic: string, updateProgress: (message: string) => void): Promise<Book> {
    const book: Book = { topic, chapters: [] };

    const chapterTitles = [
      "The 5-Figure-a-Week Dream They're Selling You",
      "Deconstructing the Guru Funnel",
      "The Wallet Autopsy: Uncovering the Hidden Costs",
      "Case Studies from the Trenches: The Good, The Bad, and The Bankrupt",
      "The Profit Illusion: Why Your Shopify Dashboard is Lying to You",
      "The Grind Nobody Shows You: From Burnout to Reality Check",
      "Escaping the Hamster Wheel: Are There Better Alternatives?",
      "Conclusion: Your Next Move (That Isn't Buying Another Course)"
    ];

    for (let i = 0; i < chapterTitles.length; i++) {
      const chapterNumber = i + 1;
      const title = chapterTitles[i];
      updateProgress(`Generating Chapter ${chapterNumber}: ${title}`);

      // 1. Generate Chapter Body
      const body = await this.generateChapterBody(topic, title);
      const newChapter: Chapter = { title, body, comic: {} as Comic };

      // 2. Generate Comic
      updateProgress(`Creating comic concept for Chapter ${chapterNumber}`);
      newChapter.comic = await this.generateComic(topic, title, body, chapterNumber);

      // 3. Generate Case Studies (for Chapter 4)
      if (chapterNumber === 4) {
        updateProgress(`Writing case studies for Chapter ${chapterNumber}`);
        newChapter.caseStudies = await this.generateCaseStudies(topic);
      }

      // 4. Generate Charts/Infographics (for specific chapters)
      if (chapterNumber === 1 || chapterNumber === 3 || chapterNumber === 5) {
        updateProgress(`Designing chart for Chapter ${chapterNumber}`);
        newChapter.chart = await this.generateChart(topic, title, chapterNumber, body);
      }
      
      book.chapters.push(newChapter);
    }
    
    updateProgress('Book generation complete!');
    return book;
  }

  private async generateChapterBody(topic: string, title: string): Promise<string> {
    const prompt = `
      You are a cynical, satirical but informative author writing a guide about the dark side of online hustles.
      Your tone is like a mix of The Oatmeal and a jaded investigative journalist.
      Your goal is to deconstruct the hype and expose the harsh realities.
      Write the body text for a chapter about "${topic}". The chapter title is "${title}".
      - Replace all [TOPIC] placeholders with specific terminology for "${topic}".
      - Use a conversational, engaging, and slightly sarcastic tone.
      - Incorporate realistic (but fictional) statistics about failure rates, median earnings, and common pitfalls.
      - Weave in references to "gurus", expensive courses, and the typical sales funnel.
      - Format the output as simple text with paragraphs separated by newlines. No markdown.
      - The chapter body should be between 400 and 600 words.
    `;
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  }

  private async generateComic(topic: string, chapterTitle: string, chapterBody: string, chapterPosition: number): Promise<Comic> {
      const prompt = `
        You are a comic book artist and layout designer creating a title page comic for a chapter about "${topic}" titled "${chapterTitle}".
        The comic features two characters:
        1. Chad: The aspiring hustler, starts clean-cut and optimistic.
        2. PosiBot: His robot sidekick, starts pristine and spews motivational quotes.

        As the chapters progress (this is chapter ${chapterPosition} of 8), both characters degrade visually.
        - Chapter 1: Chad is hopeful, PosiBot is shiny.
        - Chapter 4: Chad is stressed and tired, PosiBot is glitching and has dents.
        - Chapter 8: Chad is a wreck, PosiBot is falling apart, sparking, and spewing error messages.

        Analyze the following chapter text to find the key theme of failure or disaster:
        ---
        ${chapterBody}
        ---

        Your task is to create a JSON object that defines the comic's structure and content.
        1.  **Determine the best layout:** Based on the story, choose an effective panel count (1-4) and layout (e.g., '1x2', '2x1', '2x2', '1x3'). A '2x2' grid is good for showing cause/effect or parallel actions. A '3x1' strip is good for clear progression.
        2.  **Justify your choice:** Briefly explain why you chose this layout in a 'layoutRationale'.
        3.  **Write the prompts:** For each panel, write a detailed prompt for an AI image generator. Describe the setting (e.g., a messy home office with ${topic} products), Chad's appearance, PosiBot's condition, and a short dialogue line for each character related to the chapter's theme.

        The final JSON object must have these keys: "panelCount", "layout", "layoutRationale", "typography", "panelDescriptions".
        - "panelCount": An integer from 1 to 4.
        - "layout": A string representing the panel grid (e.g., "2x1", "2x2").
        - "layoutRationale": A string explaining why this layout is effective for the story.
        - "typography": A string for the chapter title, e.g., "Chapter ${chapterPosition}: ${chapterTitle}".
        - "panelDescriptions": An array of strings, one for each panel.
        
        The visual style is clean cartoon with bold outlines, like The Oatmeal. Output ONLY the JSON object.
      `;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as Comic;
  }

  private async generateCaseStudies(topic: string): Promise<CaseStudy[]> {
      const prompt = `
        Generate 7 character-driven case studies for a chapter on the realities of "${topic}".
        The structure must be exactly: 1 Winner, 5 Beautiful Failures, then 1 final Winner.

        For each of the 7 stories, create a JSON object with these keys:
        - "name": A memorable character name reflecting their archetype.
        - "archetype": A descriptive title for their archetype.
        - "story": A 1-2 paragraph narrative about their journey with "${topic}".
        - "financialAutopsy": A brief, cutting summary of their financial outcome.
        - "zinger": A short, memorable, and ironic concluding sentence.
        - "caricaturePrompt": A detailed prompt for an AI image generator to create a cartoon caricature.
        - "visualElement": A JSON object containing details for a visual insert.

        The "visualElement" object must have these keys:
        - "type": A string, set according to the story's position in the sequence.
        - "title": A string for the element's title.
        - "content": A string containing the element's body. For tables, format this as a markdown table.
        - "guruName": (Only for the "Guru Quote Box") A string with a fake guru name.

        Assign archetypes and visual elements based on this exact sequence:
        1.  **THE CONNECTED SUCCESS (Winner):** Unfair advantages. Visual Element type: "Advantage Audit Table".
        2.  **THE SPIRITUAL/WELLNESS TYPE (Failure):** Magical thinking. Visual Element type: "Reality Check Sidebar".
        3.  **THE TECH BRO (Failure):** Over-engineering. Visual Element type: "Financial Autopsy Table".
        4.  **THE EXPERT (Failure):** Misplaced knowledge. Visual Element type: "Guru Quote Box".
        5.  **THE SIDE HUSTLER (Failure):** Time scarcity. Visual Element type: "Time Investment Chart".
        6.  **THE OVER-ANALYZER (Failure):** Analysis paralysis. Visual Element type: "Market Competition Sidebar".
        7.  **THE INSANE GRINDER (Winner):** Unhealthy obsession. Visual Element type: "Cost-of-Success Chart".

        Ensure all financial figures and statistics mentioned are realistic for "${topic}".
        Return a JSON array of these 7 objects. Output ONLY the JSON array.
      `;
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as CaseStudy[];
  }

  private async generateChart(topic: string, title: string, chapterNumber: number, body: string): Promise<Chart> {
    const chartTypes = {
      1: { type: "Comparison Table", title: "Dream vs. Reality" },
      3: { type: "Cost Breakdown Table", title: "Wallet Autopsy" },
      5: { type: "Waterfall Chart", title: "The Profit Illusion" }
    };

    const chartInfo = chartTypes[chapterNumber as keyof typeof chartTypes];

    const prompt = `
      Based on the chapter about "${topic}" titled "${title}", create a prompt for an AI image generator to create an infographic.
      The infographic should be a "${chartInfo.type}" titled "${chartInfo.title}".
      Analyze the chapter body to extract key concepts for the infographic:
      ---
      ${body}
      ---
      The final image prompt should describe:
      - The chart type and its data points (use realistic but fictional data relevant to the text).
      - The visual style: Clean cartoon with bold outlines, thick black frames, and a brand color palette (rust: #B7410E, navy: #001F3F, gray-blue: #7D9AAA, cream: #F5F5DC).
      - The content should be satirical yet informative, fitting the book's tone.
      
      Return a JSON object with two keys: "title" (string) and "prompt" (string). Output ONLY the JSON object.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Chart;
  }
}

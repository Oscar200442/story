import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || "MANGLER_NØGLE";
const ai = new GoogleGenAI({ apiKey: apiKey });

export async function POST(req) {
  try {
    const body = await req.json();
    const { theme, history, currentChoice } = body;

    const systemInstruction = `Du er en interaktiv historiefortæller og Game Master. Temaet for denne verden er: ${theme}. 
    Skriv den næste del af historien baseret på brugerens valg. Gør det ekstremt fængende, detaljeret, med fokus på sanser, atmosfære og tag dig god tid (skriv mindst 3 lange afsnit).
    Giv derefter præcis 4 spændende, varierede og kreative valgmuligheder for, hvad brugeren kan gøre som det næste.`;

    const promptText = `
      Historik indtil nu: ${history.join(" ")}
      Brugerens seneste valg: ${currentChoice}
      
      Fortsæt historien i dyb detalje og giv mig 4 nye valgmuligheder.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // <-- Dette er den rigtige, stabile model
      contents: promptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { 
              type: Type.STRING, 
              description: "Selve den næste del af historieteksten. Skal være lang, indbydende og velskrevet." 
            },
            choices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Præcis 4 forskellige valgmuligheder."
            }
          },
          required: ["story", "choices"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return new Response(JSON.stringify(data), { status: 200 });

} catch (error) {
    console.error("API Error:", error);
    
    // Vi udtrækker den specifikke fejlbesked fra Google
    const exactError = error.message || "Ukendt fejl fra Google.";
    
    return new Response(JSON.stringify({ 
      error: true, 
      story: `⚠️ Google API Fejl: ${exactError}\n\nHvis fejlen handler om "Safety" eller "Blocked", blev historien for voldsom/eksplicit for Googles filtre. Hvis det er "429" eller "Quota", skal du vente et minut.`, 
      choices: ["Prøv at skrive en anden handling"] 
    }), { status: 500 });
  }
}

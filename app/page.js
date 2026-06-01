// app/page.js
"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [theme, setTheme] = useState("Et cyberpunk mysterie i år 2084");
  const [history, setHistory] = useState([]); // Historikken der sendes til AI'en
  const [storyLog, setStoryLog] = useState([]); // Historikken der vises på skærmen
  const [choices, setChoices] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Reference til at auto-scrolle til bunden
  const endOfStoryRef = useRef(null);

  useEffect(() => {
    // Scroll blødt ned til bunden, når der kommer ny tekst eller valg
    endOfStoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storyLog, choices, loading]);

  const fetchNextStory = async (choiceText) => {
    setLoading(true);
    setChoices([]); 
    
    // Hvis spillet allerede er i gang, viser vi brugerens valg på skærmen
    if (gameStarted) {
      setStoryLog((prev) => [...prev, { role: "user", content: choiceText }]);
    }

    try {
      const response = await fetch("/api/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: theme,
          history: history,
          currentChoice: choiceText,
        }),
      });

      const data = await response.json();
      
      // Opdater både den usynlige API-historik og den synlige UI-historik
      setHistory((prev) => [...prev, `Brugeren valgte: ${choiceText}`, data.story]);
      setStoryLog((prev) => [...prev, { role: "ai", content: data.story }]);
      
      setChoices(data.choices);
      setGameStarted(true);

    } catch (error) {
      console.error(error);
      setStoryLog((prev) => [...prev, { role: "ai", content: "Der opstod en fejl i forbindelsen til Game Masteren." }]);
    } finally {
      setLoading(false);
      setCustomInput("");
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customInput.trim() !== "") {
      fetchNextStory(customInput);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="w-full p-6 border-b border-gray-800/60 bg-[#0a0a0f]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-black text-center tracking-wide bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
          AI Storyweaver
        </h1>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
        <div className="max-w-3xl mx-auto w-full">
          
          {/* Startskærm */}
          {!gameStarted && (
            <div className="mt-12 bg-gray-900/50 border border-gray-800 p-8 rounded-2xl shadow-2xl">
              <h2 className="text-xl font-semibold mb-6 text-gray-200">Start et nyt eventyr</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Beskriv den verden du vil udforske:</label>
                  <textarea 
                    rows="3"
                    className="w-full p-4 rounded-xl bg-[#13131a] border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none text-gray-200"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => fetchNextStory("Begynd historien.")}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2"
                >
                  Træd ind i historien
                </button>
              </div>
            </div>
          )}

          {/* Selve Historien */}
          {gameStarted && (
            <div className="space-y-8 pb-8">
              {storyLog.map((msg, index) => (
                <div key={index} className="animate-fade-in">
                  {msg.role === "user" ? (
                    <div className="flex justify-end my-6">
                      <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-5 py-3 rounded-2xl rounded-tr-sm text-sm font-medium tracking-wide max-w-[80%] shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg tracking-wide">
                      {msg.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="flex items-center gap-3 text-indigo-400 font-medium my-8 p-4 bg-indigo-950/20 rounded-xl border border-indigo-900/30 w-fit">
              <svg className="animate-spin h-5 w-5 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI'en spinder historien videre...
            </div>
          )}

          {/* Valgmuligheder i bunden */}
          {!loading && choices.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-800/60">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Træf dit valg</h3>
              <div className="grid grid-cols-1 gap-3">
                {choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => fetchNextStory(choice)}
                    className="text-left bg-[#13131a] hover:bg-gray-800 border border-gray-800 hover:border-indigo-500/50 p-4 rounded-xl transition-all text-sm font-medium text-gray-300 hover:text-white shadow-sm"
                  >
                    {choice}
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <form onSubmit={handleCustomSubmit} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="...eller skriv præcis hvad du vil gøre"
                    className="flex-1 p-4 rounded-xl bg-[#13131a] border border-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-gray-200 transition-all"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 px-6 py-4 rounded-xl font-bold text-sm text-white transition-all"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}
          
          {/* Usynligt element til auto-scroll */}
          <div ref={endOfStoryRef} className="h-4"></div>
        </div>
      </div>
    </main>
  );
}

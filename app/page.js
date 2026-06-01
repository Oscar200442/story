"use client";
import { useState } from "react";

export default function Home() {
  const [theme, setTheme] = useState("Et cyberpunk mysterie i år 2084");
  const [history, setHistory] = useState([]);
  const [currentStory, setCurrentStory] = useState("Velkommen. Hvilken verden vil du træde ind i?");
  const [choices, setChoices] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const fetchNextStory = async (choiceText) => {
    setLoading(true);
    setChoices([]); 
    
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
      
      setHistory((prev) => [...prev, `Brugeren valgte: ${choiceText}`, data.story]);
      setCurrentStory(data.story);
      setChoices(data.choices);
      setGameStarted(true);

    } catch (error) {
      console.error(error);
      setCurrentStory("Der opstod en fejl i forbindelsen til Game Masteren.");
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
    <main className="min-h-screen bg-gray-950 text-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-extrabold mb-6 text-center tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          AI Storyweaver
        </h1>

        {!gameStarted && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-400">Skriv eller vælg et tema for dit eventyr:</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />
            <button 
              onClick={() => fetchNextStory("Begynd historien.")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
            >
              Start Eventyret
            </button>
          </div>
        )}

        {gameStarted && (
          <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mb-6 whitespace-pre-wrap leading-relaxed text-gray-300">
            {currentStory}
          </div>
        )}

        {loading && (
          <div className="text-center animate-pulse text-indigo-400 font-medium my-6">
            AI'en spinder historien videre...
          </div>
        )}

        {!loading && choices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">Hvad gør du nu?</h3>
            {choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => fetchNextStory(choice)}
                className="w-full text-left bg-gray-800 hover:bg-gray-700/80 border-l-4 border-indigo-500 p-4 rounded-xl transition-all text-sm font-medium"
              >
                {choice}
              </button>
            ))}
            
            <form onSubmit={handleCustomSubmit} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Eller skriv din helt egen handling..."
                className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700 focus:border-indigo-500 outline-none text-sm"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

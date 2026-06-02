"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [theme, setTheme] = useState("Et cyberpunk mysterie i år 2084");
  const [characterContext, setCharacterContext] = useState("");
  const [history, setHistory] = useState([]); 
  const [storyLog, setStoryLog] = useState([]); 
  const [choices, setChoices] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const endOfStoryRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll til bunden af historien
  useEffect(() => {
    endOfStoryRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [storyLog, choices, loading]);

  // Håndter auto-udvidelse af input feltet
  const handleInputResize = (e) => {
    setCustomInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  const fetchNextStory = async (choiceText) => {
    if (!choiceText.trim()) return;
    
    setLoading(true);
    setChoices([]); 
    
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
          characterContext: characterContext,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        setStoryLog((prev) => [...prev, { role: "ai", content: `⚠️ Systemfejl: ${data.story || "Kunne ikke forbinde til AI."}` }]);
        setChoices(data.choices || []);
        setGameStarted(true);
        setLoading(false);
        return;
      }
      
      setHistory((prev) => [...prev, `Brugeren valgte: ${choiceText}`, data.story]);
      setStoryLog((prev) => [...prev, { role: "ai", content: data.story }]);
      setChoices(data.choices);
      setGameStarted(true);

    } catch (error) {
      console.error(error);
      setStoryLog((prev) => [...prev, { role: "ai", content: "⚠️ Der opstod en kritisk fejl i netværket." }]);
    } finally {
      setLoading(false);
      setCustomInput("");
      // Nulstil højden på tekstfeltet
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Lyt efter "Enter" (uden shift) for at sende
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchNextStory(customInput);
    }
  };

  return (
    <main className="h-screen bg-[#050505] text-gray-200 flex flex-col font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* HEADER */}
      <header className="w-full p-5 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl shrink-0 z-20 shadow-sm">
        <h1 className="text-xl font-black text-center tracking-widest bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent uppercase">
          AI Storyweaver
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBJÆLKE: Karakterer & Personlighed */}
        <aside className="hidden lg:flex w-80 flex-col border-r border-white/5 bg-[#0a0a0c] p-6 shrink-0 z-10 shadow-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Persongalleri & Kontekst
          </h2>
          <p className="text-sm text-gray-400 mb-5 leading-relaxed">
            Beskriv personernes træk eller motiver. AI'en integrerer dette permanent i historien.
          </p>
          <textarea
            className="flex-1 w-full p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none text-sm text-gray-300 leading-relaxed placeholder-gray-600 custom-scrollbar"
            placeholder="F.eks.: Kael er dybt mistænksom overfor alle og taler altid i korte, kyniske sætninger..."
            value={characterContext}
            onChange={(e) => setCharacterContext(e.target.value)}
          ></textarea>
        </aside>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative bg-gradient-to-b from-[#0a0a0c] to-[#050505] custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full p-4 md:p-8">
            
            {!gameStarted && (
              <div className="mt-10 bg-white/5 border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl backdrop-blur-sm transition-all hover:border-white/20">
                <h2 className="text-2xl font-bold mb-8 text-white tracking-wide">Start et nyt eventyr</h2>
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Verdenens tema</label>
                    <textarea 
                      rows="3"
                      className="w-full p-5 rounded-2xl bg-[#0f0f13] border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none text-gray-200 text-lg leading-relaxed shadow-inner"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => fetchNextStory("Begynd historien.")}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 px-6 rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] transition-all flex justify-center items-center gap-3 text-lg"
                  >
                    Træd ind i historien
                  </button>
                </div>
              </div>
            )}

            {gameStarted && (
              <div className="space-y-10 pb-8">
                {storyLog.map((msg, index) => (
                  <div key={index} className="animate-fade-in group">
                    {msg.role === "user" ? (
                      <div className="flex justify-end my-6">
                        <div className="bg-indigo-600/20 backdrop-blur-md border border-indigo-500/30 text-indigo-100 px-6 py-4 rounded-3xl rounded-tr-sm text-base font-medium tracking-wide max-w-[85%] shadow-lg">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-300 text-lg md:text-xl leading-[1.8] tracking-wide font-light">
                        {/* ReactMarkdown gør at **fed** og *kursiv* virker */}
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-6 last:mb-0" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-white bg-white/5 px-1 rounded" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-gray-400" {...props} />
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-4 text-indigo-400 font-medium my-10 p-5 bg-indigo-950/20 rounded-2xl border border-indigo-900/30 w-fit shadow-inner backdrop-blur-sm">
                <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Væver historien videre...
              </div>
            )}

            {!loading && choices.length > 0 && (
              <div className="mt-16 pt-10 border-t border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 pl-2">Hvad gør du nu?</h3>
                <div className="grid grid-cols-1 gap-4">
                  {choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => fetchNextStory(choice)}
                      className="text-left bg-white/5 hover:bg-indigo-900/30 border border-white/10 hover:border-indigo-500/50 p-5 rounded-2xl transition-all duration-300 text-base md:text-lg text-gray-300 hover:text-white shadow-sm hover:shadow-indigo-500/10 group"
                    >
                      <span className="text-indigo-500/50 group-hover:text-indigo-400 font-bold mr-3">{index + 1}.</span> 
                      {choice}
                    </button>
                  ))}
                </div>
                
                <div className="mt-8 relative group">
                  <textarea
                    ref={textareaRef}
                    rows="1"
                    placeholder="...eller beskriv præcis hvad du vil gøre (Tryk Enter for at sende)"
                    className="w-full p-5 pr-24 rounded-2xl bg-[#0f0f13] border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-base text-gray-200 transition-all resize-none overflow-y-hidden"
                    value={customInput}
                    onChange={handleInputResize}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    onClick={() => fetchNextStory(customInput)}
                    disabled={!customInput.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500 text-white p-3 rounded-xl transition-all font-bold text-sm shadow-md"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
            
            <div ref={endOfStoryRef} className="h-20"></div>
          </div>
        </div>
      </div>
      
      {/* Lille CSS tilføjelse til scrollbaren for at gøre den pænere */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </main>
  );
}

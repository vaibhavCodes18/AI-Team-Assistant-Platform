import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LuSparkles,
  LuArrowRight,
  LuCode,
  LuTerminal,
  LuUsers,
  LuZap,
  LuCpu,
  LuGithub,
  LuLinkedin,
  LuTwitter,
  LuMail,
  LuChevronRight,
  LuActivity,
  LuFileText,
  LuShieldCheck,
  LuLayers,
} from "react-icons/lu";

// Simulated terminal sequence (no Kafka or Redis)
const terminalLines = [
  { text: "guest@ai-assistant:~$ assistant doc --generate", delay: 800 },
  { text: "🛰️ Scanning project directory for controllers...", delay: 1800 },
  { text: "📝 Found: DocumentController.java, WorkspaceController.java", delay: 2800 },
  { text: "⚙️ Spawning background analysis worker threads...", delay: 4000 },
  { text: "⚡ Checking local schema memory metadata... Cache Miss", delay: 5200 },
  { text: "🧠 Invoking Gemini AI model for controller code structure...", delay: 6500 },
  { text: "📄 Generating OpenAPI v3 spec docs with Gemini...", delay: 8000 },
  { text: "✅ Schema generated successfully!", delay: 9200, color: "text-green-400" },
  { text: "💾 Compiling documentation index...", delay: 10000 },
  { text: "💡 GENERATED ROUTE SUMMARY:", delay: 10800, color: "text-indigo-400 font-semibold" },
  { text: "   • GET  /api/v1/docs/summary  -> Return summaries", delay: 11400 },
  { text: "   • POST /api/v1/docs/upload   -> Ingest document", delay: 12000 },
  { text: "   • PUT  /api/v1/tasks/assign  -> Assign task via Gemini routing", delay: 12600 },
  { text: "🚀 API Documentation is now live at http://localhost:8080/swagger-ui.html", delay: 13500, color: "text-cyan-400 font-semibold" }
];

const LandingPage = () => {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Terminal active lines state
  const [activeTerminalLines, setActiveTerminalLines] = useState([]);
  const terminalContainerRef = useRef(null);

  // Workflow explorer active tab (Only summarizer and apigen)
  const [activeTab, setActiveTab] = useState("summarizer");

  // Summarizer mockup state
  const [summaryState, setSummaryState] = useState("idle"); // idle | processing | done
  const [summarizerProgress, setSummarizerProgress] = useState(0);

  // Reset terminal sequence periodically or loop
  useEffect(() => {
    setActiveTerminalLines([]);
    const timers = [];

    terminalLines.forEach((line) => {
      const timer = setTimeout(() => {
        setActiveTerminalLines((prev) => [...prev, line]);
      }, line.delay);
      timers.push(timer);
    });

    // Reset sequence after 22 seconds for loop effect
    const resetTimer = setTimeout(() => {
      setActiveTerminalLines([]);
      terminalLines.forEach((line) => {
        const timer = setTimeout(() => {
          setActiveTerminalLines((prev) => [...prev, line]);
        }, line.delay);
        timers.push(timer);
      });
    }, 22000);
    timers.push(resetTimer);

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [activeTerminalLines]);

  // Summarizer simulation handler
  const handleUploadSimulate = () => {
    if (summaryState !== "idle") return;
    setSummaryState("processing");
    setSummarizerProgress(0);

    const interval = setInterval(() => {
      setSummarizerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSummaryState("done");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleResetSummarizer = () => {
    setSummaryState("idle");
    setSummarizerProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-violet-600/30 selection:text-violet-300">
      
      {/* Grid overlay background */}
      <div className="absolute inset-0 bg-grid-glow pointer-events-none opacity-60 z-0"></div>

      {/* Floating neon accent lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-violet-700/10 blur-[150px] pointer-events-none z-0 neon-glow-violet"></div>
      <div className="absolute top-[35%] right-[-10%] w-[40%] h-[30%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none z-0 neon-glow-indigo"></div>
      <div className="absolute bottom-[10%] left-[-5%] w-[45%] h-[35%] rounded-full bg-cyan-700/5 blur-[130px] pointer-events-none z-0 neon-glow-cyan"></div>

      {/* Translucent Premium Header Navigation */}
      <nav className="flex justify-between items-center h-20 px-8 w-full sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 transition-all duration-300">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
              <LuSparkles className="text-white text-xl animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white group-hover:text-violet-400 transition-colors">
                AI Team Assistant
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                COLLABORATION PLATFORM
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Features</a>
            <a href="#explore" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Explore</a>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2">
            Sign In
          </Link>
          <Link to="/register" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 hover:scale-[1.02] active:scale-95 transition-all duration-300">
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu hamburger button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none transition"
        >
          {mobileMenuOpen ? (
            <span className="font-bold text-lg">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>

        {/* Mobile menu content overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 w-full bg-slate-950 border-b border-slate-900 p-6 flex flex-col gap-4 z-40 animate-in fade-in slide-in-from-top-5 duration-200">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white py-2 text-base font-medium">Features</a>
            <a href="#explore" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-white py-2 text-base font-medium">Explore</a>
            <hr className="border-slate-900" />
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-slate-300 hover:text-white py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-violet-600 hover:bg-violet-700 text-white text-center py-3 rounded-xl text-sm font-semibold shadow-lg">
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-8 max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/40 border border-violet-500/30 mb-8 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                v2.4 Intelligent Engine Now Live
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
              AI Team Assistant
              <span className="block mt-2 bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent shimmer-text">
                Collaboration Platform
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-2xl">
              AI Team Assistant Platform is a multi-workspace collaboration and project management platform that helps software teams manage projects, tickets, and technical documents with AI-powered document summarization and automatic API documentation generation, similar to Jira.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white text-center px-8 py-4 rounded-xl font-semibold shadow-xl shadow-violet-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <LuArrowRight className="text-lg" />
              </Link>
              <a
                href="#explore"
                className="border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 text-slate-300 hover:text-white text-center px-8 py-4 rounded-xl font-semibold hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Explore Workspace
              </a>
            </div>

            {/* Quick Tech Badge */}
            <div className="mt-12 pt-8 border-t border-slate-900 w-full">
              <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block mb-4">
                ENGINEERED WITH MODERN STACK
              </span>
              <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800"><LuCpu className="text-violet-500" /> Spring Boot</span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800"><LuZap className="text-amber-500" /> Gemini AI</span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800"><LuLayers className="text-indigo-500" /> React Layer</span>
              </div>
            </div>
          </div>

          {/* Right Column: Simulated Live CLI Terminal */}
          <div className="lg:col-span-5 relative w-full">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-xl opacity-60 rounded-3xl"></div>
            
            {/* Real CLI Interface Mockup */}
            <div className="relative w-full rounded-2xl border border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-md overflow-hidden font-mono text-left">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-red-500/90 shadow-inner"></span>
                  <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/90 shadow-inner"></span>
                  <span className="h-3.5 w-3.5 rounded-full bg-green-500/90 shadow-inner"></span>
                </div>
                <div className="text-xs text-slate-500 font-semibold select-none flex items-center gap-2">
                  <LuTerminal className="text-slate-600" /> ai-team-assistant-cli
                </div>
                <div className="w-12"></div> {/* Spacer */}
              </div>

              {/* Terminal Screen area */}
              <div 
                ref={terminalContainerRef}
                className="p-6 h-[340px] overflow-y-auto custom-scrollbar text-xs leading-relaxed text-slate-300"
              >
                <div className="space-y-2">
                  {activeTerminalLines.map((line, idx) => (
                    <div 
                      key={idx} 
                      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${line.color || "text-slate-300"}`}
                    >
                      {line.text}
                    </div>
                  ))}
                  {/* blinking cursor on target line if typing is incomplete */}
                  {activeTerminalLines.length < terminalLines.length && (
                    <div className="terminal-cursor text-slate-400"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section with Glass Bento Grid */}
      <section id="features" className="py-28 px-8 max-w-7xl mx-auto z-10 relative">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="text-violet-500 font-bold uppercase tracking-wider text-xs bg-violet-500/10 px-3 py-1 rounded-full">
            Core Features
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Designed for Modern Dev Teams
          </h2>
          <p className="mt-5 text-slate-400 text-lg">
            Simplify multi-workspace collaboration, handle team sprint backlogs, and track tickets side-by-side with AI-driven summaries and document pipelines.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Intelligent Summarizer */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-8 glow-card-hover flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-600/10 transition-all"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-6">
                <LuFileText className="text-violet-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Intelligent Spec Summarizer
              </h3>
              <p className="text-slate-400 mb-6 max-w-2xl">
                Upload architecture draft PDFs, meeting transcripts, or markdown docs. 
                Our Gemini AI engine parses text asynchronously using background threads and indexes it for instant load.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">AI Worker Threads</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">PDF Parsing</span>
              <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400">Gemini Pro Summaries</span>
            </div>
          </div>

          {/* Card 2: API Documentation */}
          <div className="glass-card rounded-2xl p-8 glow-card-hover flex flex-col justify-between overflow-hidden group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <LuCode className="text-indigo-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                AI API Gen
              </h3>
              <p className="text-slate-400 mb-6">
                Provide code snippets, controllers, or database schemas. Instantly get interactive Swagger / OpenAPI reference documents.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[11px] text-violet-400 border border-slate-900">
              <code>POST /api/docs/generate</code>
            </div>
          </div>

          {/* Card 3: Realtime Updates */}
          <div className="glass-card rounded-2xl p-8 glow-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <LuActivity className="text-cyan-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Smart Work Alerts
              </h3>
              <p className="text-slate-400">
                Receive context-rich live notifications on ticket assignments, workspace updates, or document summaries in real-time.
              </p>
            </div>
          </div>

          {/* Card 4: Jira-like Agile Boards */}
          <div className="glass-card rounded-2xl p-8 glow-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <LuLayers className="text-emerald-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Jira-Like Agile Boards
              </h3>
              <p className="text-slate-400">
                Manage projects, sprint backlogs, and user tickets with interactive Kanban boards, role-based access controls, and AI-assisted workflow routing.
              </p>
            </div>
          </div>

          {/* Card 5: Security & Isolation */}
          <div className="glass-card rounded-2xl p-8 glow-card-hover flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <LuShieldCheck className="text-purple-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Enterprise Shield
              </h3>
              <p className="text-slate-400">
                Secure multi-workspace collaboration with role-based token validation, encrypted file storage, and total data isolation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Explorer Section */}
      <section id="explore" className="py-24 bg-slate-900/40 border-y border-slate-900/60 z-10 relative">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column Text / Tabs */}
            <div className="lg:col-span-5 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-violet-500 bg-violet-500/10 px-3 py-1 rounded-full">
                Interactive Demo
              </span>
              <h2 className="mt-4 text-4xl font-extrabold text-white tracking-tight">
                Simulate AI Workspace Features
              </h2>
              <p className="mt-4 text-slate-400">
                Switch through tabs to simulate how AI document summarization and automatic API documentation generation works.
              </p>

              {/* Tab selectors */}
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { id: "summarizer", label: "Gemini Document Summarizer", icon: LuFileText },
                  { id: "apigen", label: "OpenAPI Documentation Generator", icon: LuCode },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-semibold border transition-all duration-300 text-left ${
                        isActive 
                          ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/10" 
                          : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <Icon className={`text-lg ${isActive ? "text-white" : "text-slate-500"}`} />
                      <span>{tab.label}</span>
                      <LuChevronRight className={`ml-auto transition-transform ${isActive ? "translate-x-1" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Tab View Box */}
            <div className="lg:col-span-7 w-full">
              <div className="glass-card rounded-2xl p-8 border border-slate-800 bg-slate-950/70 h-[380px] flex flex-col justify-between relative overflow-hidden text-left shadow-xl">
                
                {activeTab === "summarizer" && (
                  <div className="h-full flex flex-col justify-between animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Simulate Summarizer</h3>
                      <p className="text-xs text-slate-400">Upload a mock document and check Gemini AI processing.</p>
                      
                      <div className="mt-6 border border-dashed border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-900/20">
                        {summaryState === "idle" && (
                          <>
                            <LuFileText className="text-slate-600 text-4xl mb-3" />
                            <span className="text-xs text-slate-300 font-semibold mb-1">spec_draft_v3.pdf</span>
                            <span className="text-[10px] text-slate-500 mb-4">Size: 4.2 MB</span>
                            <button
                              onClick={handleUploadSimulate}
                              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition"
                            >
                              Ingest & Summarize
                            </button>
                          </>
                        )}

                        {summaryState === "processing" && (
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs text-violet-400 font-mono mb-2">Analyzing with Gemini ({summarizerProgress}%)</span>
                            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden max-w-xs">
                              <div className="h-full bg-violet-500 rounded-full transition-all duration-150" style={{ width: `${summarizerProgress}%` }}></div>
                            </div>
                          </div>
                        )}

                        {summaryState === "done" && (
                          <div className="w-full text-left">
                            <span className="text-xs font-bold text-green-400 block mb-2">✓ Summary Generated via Gemini:</span>
                            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                              <li>Automated parsing completed successfully.</li>
                              <li>Security tokens validated.</li>
                              <li>Gemini API integrated inside Spring Boot controller pipelines.</li>
                            </ul>
                            <button 
                              onClick={handleResetSummarizer}
                              className="mt-4 text-[10px] text-slate-500 hover:text-white underline cursor-pointer"
                            >
                              Reset Simulation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Gemini AI Engine: Active
                    </div>
                  </div>
                )}

                {activeTab === "apigen" && (
                  <div className="h-full flex flex-col justify-between animate-in fade-in duration-300">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">API Documentation Generator</h3>
                      <p className="text-xs text-slate-400">View how raw Spring Boot controller maps to Swagger spec documentation.</p>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/60 font-mono text-[10px] text-slate-300 h-44 overflow-y-auto custom-scrollbar leading-relaxed">
                          <span className="text-amber-400">@RestController</span><br/>
                          <span className="text-purple-400">public class</span> <span className="text-violet-400">DocController</span> &#123;<br/>
                          &nbsp;&nbsp;<span className="text-amber-400">@PostMapping</span>(<span className="text-green-400">"/upload"</span>)<br/>
                          &nbsp;&nbsp;<span className="text-purple-400">public</span> Response <span className="text-cyan-400">upload</span>(Doc d) &#123;<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;helperTemplate.send(d);<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> Response.ok();<br/>
                          &nbsp;&nbsp;&#125;<br/>
                          &#125;
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/60 font-mono text-[10px] text-slate-300 h-44 overflow-y-auto custom-scrollbar leading-relaxed">
                          <span className="text-violet-400">openapi</span>: <span className="text-amber-400">3.0.0</span><br/>
                          <span className="text-violet-400">info</span>:<br/>
                          &nbsp;&nbsp;<span className="text-violet-400">title</span>: <span className="text-green-400">"AI Assistant API"</span><br/>
                          <span className="text-violet-400">paths</span>:<br/>
                          &nbsp;&nbsp;<span className="text-violet-400">/api/v1/docs/upload</span>:<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">post</span>:<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">summary</span>: <span className="text-green-400">"Upload a doc"</span><br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">responses</span>:<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">200</span>:<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-violet-400">description</span>: <span className="text-green-400">"Success"</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">OpenAPI generator build completed.</div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-center z-10 relative">
        <div className="max-w-4xl mx-auto px-8">
          <div className="glass-card rounded-[32px] p-12 md:p-16 border border-slate-800/80 bg-gradient-to-br from-slate-900/60 to-slate-950 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
              <LuSparkles className="text-violet-400 text-sm" />
              <span className="text-xs font-semibold text-violet-400">Increase Velocity Today</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Ready to Accelerate With <br />AI Team Assistant Platform?
            </h2>

            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Create your secure workspaces, manage team tickets, summarize project documents, and generate API specs with Gemini AI in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-8 py-4 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold px-8 py-4 rounded-xl hover:scale-105 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-20 px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16 text-left">
            
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <LuSparkles className="text-white text-sm" />
                </div>
                <span className="font-bold text-lg text-white">AI Team Assistant</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-6">
                The next-generation intelligence layer for high-performance developer and product organizations.
              </p>
              
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><LuGithub className="text-lg" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><LuLinkedin className="text-lg" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><LuTwitter className="text-lg" /></a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"><LuMail className="text-lg" /></a>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-5">Product</h5>
              <ul className="space-y-3.5 text-slate-400 text-sm">
                <li><a href="#features" className="hover:text-violet-400 transition">Features</a></li>
                <li><a href="#explore" className="hover:text-violet-400 transition">Workflow Demo</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-5">Resources</h5>
              <ul className="space-y-3.5 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-violet-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">API Specs</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-5">Company</h5>
              <ul className="space-y-3.5 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-violet-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white text-sm mb-5">Legal</h5>
              <ul className="space-y-3.5 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-violet-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-violet-400 transition">Security Spec</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} AI Team Assistant Platform. All rights reserved.
            </p>
            
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-slate-300 font-semibold tracking-wide">
                All Core Services Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;

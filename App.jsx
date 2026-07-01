import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain } from "lucide-react";

// Component imports
import SubjectSelector from "./components/SubjectSelector.jsx";
import QuizEngine from "./components/QuizEngine.jsx";
import ScoreDashboard from "./components/ScoreDashboard.jsx";
import AdminPortal from "./components/AdminPortal.jsx";

export default function App() {
  const [activeView, setActiveView] = useState("selector");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Active quiz session states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState({});
  const [quizDuration, setQuizDuration] = useState(0);

  // Admin portal state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [dbRefreshTrigger, setDbRefreshTrigger] = useState(0);

  const handleSelectCategory = (subject, topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setActiveView("quiz");
  };

  const handleQuizComplete = (responses, questions, durationSeconds) => {
    setUserResponses(responses);
    setQuizQuestions(questions);
    setQuizDuration(durationSeconds);
    setActiveView("dashboard");
  };

  const handleStartSuggestedQuiz = (suggestedSubject, suggestedTopic) => {
    setSelectedSubject(suggestedSubject);
    setSelectedTopic(suggestedTopic);
    setActiveView("quiz");
  };

  const handleRestart = () => {
    setSelectedSubject(null);
    setActiveView("selector");
    setSelectedTopic(null);
    setQuizQuestions([]);
    setQuizDuration(0);
    setUserResponses({});
  };

  const handleQuestionAdded = () => {
    setDbRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div
      className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-serif"
      id="app-root"
    >
      <header
        className="bg-[#FDFCFB] border-b border-[#1A1A1A]/10 sticky top-0 z-40"
        id="main-header"
      >
            <div className="max-w-6xl mx-auto px-2 sm:px-6 py-2 flex items-center gap-2 cursor-pointer" onClick={handleRestart}>
              <Brain className="w-6 h-6 text-[#1A1A1A] stroke-[1.5]" />
              <h1 className="text-3xl font-light tracking-tight italic font-serif text-[#1A1A1A]">
                SmartCoach
              </h1>
            </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col" id="main-stage">
        <AnimatePresence mode="wait">
          {activeView === "selector" && (
            <motion.div
              key={`selector-view-${dbRefreshTrigger}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1"
            >
              <SubjectSelector
                onSelectCategory={handleSelectCategory}
                onOpenAdmin={() => setIsAdminOpen(true)}
                selectedSubject = {selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            </motion.div>
          )}

          {activeView === "quiz" && selectedSubject && (
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col justify-center"
            >
              <QuizEngine
                subject={selectedSubject}
                topic={selectedTopic}
                onQuizComplete={handleQuizComplete}
                onQuit={handleRestart}
              />
            </motion.div>
          )}

          {activeView === "dashboard" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="flex-1"
            >
              <ScoreDashboard
                subject={selectedSubject || "Mock Subject"}
                topic={selectedTopic}
                questions={quizQuestions}
                responses={userResponses}
                durationSeconds={quizDuration}
                onRestart={handleRestart}
                onStartSuggestedQuiz={handleStartSuggestedQuiz} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-over custom question injection drawer */}
      {isAdminOpen && (
        <AdminPortal
          onClose={() => setIsAdminOpen(false)}
          onQuestionAdded={handleQuestionAdded}
        />
      )}

      {/* Editorial Sophisticated Footer */}
      <footer
        className="bg-[#1A1A1A] text-white py-8 px-6 mt-12 border-t border-[#1A1A1A]/10 font-sans"
        id="main-footer"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-sans">
            © 2026 LexiPrep Systems // SmartCoach CGL Simulator
          </p>
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
            <span className="hover:text-[#C2410C] transition cursor-help">
              Review Policy
            </span>
            <span className="hover:text-[#C2410C] transition cursor-help">
              Secure DB
            </span>
            <span className="hover:text-[#C2410C] transition cursor-help">
              Methodology
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

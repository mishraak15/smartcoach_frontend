import React, { useEffect, useState, useRef } from "react";
import {
  Loader,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function QuizEngine({
  subject,
  topic,
  onQuizComplete,
  onQuit,
  tenQuesMode = true,
}) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const maxTimePerQuestion = 60;
  const [maxTimeForTest, setMaxTimeForTest] = useState(maxTimePerQuestion);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Timers
  const [totalTime, setTotalTime] = useState(0);
  const questionStartTimesRef = useRef({});
  const [questionTimeSpents, setQuestionTimeSpents] = useState({});
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmitQuizRef = useRef(null);

  useEffect(() => {
    let url = `${API_BASE_URL}/api/questions?subject=${encodeURIComponent(
      subject,
    )}`;
    if (topic) {
      url += `&topic=${encodeURIComponent(topic)}`;
    }
    if (!tenQuesMode) {
      url += `&ques=${encodeURIComponent("all")}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            "Could not find enough questions for this selection.",
          );
        return res.json();
      })
      .then((data) => {
        setQuestions(data.questions);
        let maxTime = data.questions.length * maxTimePerQuestion;
        setMaxTimeForTest(maxTime);
        setTotalTime(maxTime);

        // Initialize question timers
        const now = Date.now();
        const initialTimes = {};
        data.questions.forEach((q, idx) => {
          initialTimes[idx] = idx === 0 ? now : 0;
        });
        setLoading(false);
        questionStartTimesRef.current = initialTimes;
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [subject, topic]);

  // Overall test timer ticking
  useEffect(() => {
    if (loading || error || questions.length === 0 || confirmSubmit) return;

    const interval = setInterval(() => {
      setTotalTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-submit when time is up
          setTimeout(() => {
            if (handleSubmitQuizRef.current) {
              handleSubmitQuizRef.current();
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });

      // Also increment current question time spent
      setQuestionTimeSpents((prev) => {
        const activeIndex = currentIndexRef.current;
        const currentSpent = prev[activeIndex] || 0;
        return {
          ...prev,
          [activeIndex]: currentSpent + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, error, questions, confirmSubmit]);

  // Handle switching questions
  const handleJumpToQuestion = (index) => {
    if (index === currentIndex) return;

    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      handleJumpToQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleJumpToQuestion(currentIndex - 1);
    }
  };

  const handleSelectOption = (option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const handleClearAnswer = () => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: null,
    }));
  };

  const handleSubmitQuiz = () => {
    const finalResponses = {};

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx] || null;
      const isCorrect = selected === q.correctOption;
      finalResponses[q.id] = {
        questionId: q.id,
        selectedOption: selected,
        isCorrect: isCorrect,
        timeSpentSeconds: questionTimeSpents[idx] || 0,
      };
    });

    onQuizComplete(finalResponses, questions, maxTimeForTest - totalTime);
  };

  handleSubmitQuizRef.current = handleSubmitQuiz;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleQuit = () => {
    // IF success
    setConfirmQuit(false);
    onQuit();
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-100"
        id="quiz-loading"
      >
        <Loader className="w-8 h-8 text-[#8C8C8C] animate-spin mb-4" />
        <p className="text-[#8C8C8C] font-sans text-xs uppercase tracking-widest">
          Assembling diagnostic questions from database...
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div
        className="bg-[#FDFCFB] border border-[#C2410C]/20 rounded-none p-10 text-center max-w-lg mx-auto my-12"
        id="quiz-error"
      >
        <AlertCircle className="w-10 h-10 text-[#C2410C] mx-auto mb-4" />
        <p className="text-[#1A1A1A] font-serif italic text-xl mb-2">
          Insufficient Exam Resources
        </p>
        <p className="text-[#555] text-xs font-sans leading-relaxed mb-8">
          {error ||
            `We don't have enough questions under the selected subject "${subject}" to formulate a standard 10-question test.`}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onQuit}
            className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-[#FDFCFB] font-sans text-[10px] uppercase tracking-wider font-bold transition duration-200"
          >
            ← Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.values(selectedAnswers).filter(
    (ans) => ans !== null,
  ).length;

  return (
    <div className="max-w-6xl mx-auto p-5" id="quiz-dashboard">
      <button
        onClick={() => setConfirmQuit(true)}
        className={`px-5 py-2.5 bg-[#C2410C] hover:bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-bold transition duration-200 cursor-pointer absolute top-[1em] z-100 right-[4%] ${
          confirmQuit ? "hidden" : "block"
        }`}
      >
        QUIT TEST
      </button>
      <div
        className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[#1A1A1A]/10 pb-2 mb-4 gap-4"
        id="quiz-topbar"
      >
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8C8C] mb-2">
            Active Examination Session / Unit Code
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-light font-serif text-[#1A1A1A] italic">
              {subject}
            </h2>
            {topic && (
              <span className="text-[10px] font-sans uppercase tracking-widest text-[#555] px-2.5 py-1 bg-[#F5F2EE] border border-[#1A1A1A]/10">
                {topic}
              </span>
            )}
            <span className="text-[11px] font-sans text-[#8C8C8C]">
              ({answeredCount} of {totalQuestions} answered)
            </span>
          </div>
        </div>

        {/* Dynamic Global Timer */}
        <div className="flex items-center gap-6 self-start md:self-auto font-sans">
          <div
            className={`flex items-center gap-2 font-mono text-xs font-bold px-4 py-2 border transition-colors duration-200 ${
              totalTime < 60
                ? "text-rose-600 bg-rose-50 border-rose-300 animate-pulse"
                : "text-[#1A1A1A] bg-[#F5F2EE] border-[#1A1A1A]/10"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>REMAINING: {formatTime(totalTime)}</span>
          </div>
          <button
            onClick={() => setConfirmSubmit(true)}
            className="px-5 py-2.5 bg-[#C2410C] hover:bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-bold transition duration-200 cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        id="quiz-main-grid"
      >
        {/* Left/Middle: Question & Answer Option Card */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-fit">
          <div
            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-6 md:p-4 flex-1 flex flex-col justify-between"
            id="question-card"
          >
            <div>
              {/* Question metadata */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1A1A1A]/10">
                <span className="text-[10px] font-sans uppercase tracking-widest font-bold text-[#8C8C8C]">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 border border-[#1A1A1A]/15 bg-gray-100 hover:bg-white disabled:opacity-20 transition cursor-pointer"
                    title="Previous Question"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === totalQuestions - 1}
                    className="p-2 border border-[#1A1A1A]/15 bg-gray-100 hover:bg-white disabled:opacity-20 transition cursor-pointer"
                    title="Next Question"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-xl md:text-2xl font-serif font-light text-[#1A1A1A] leading-relaxed mb-3 whitespace-pre-wrap">
                {currentQuestion.question}
              </h2>

              {/* Options List */}
              <div className="grid grid-cols-1 gap-4 mb-6" id="options-grid">
                {currentQuestion.options.map((option, idx) => {
                  const letter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = selectedAnswers[currentIndex] === option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className={`flex items-center p-2 border text-left  transition duration-200 cursor-pointer text-[#1A1A1A] ${
                        isSelected
                          ? "bg-green-200 border-green-300 "
                          : "bg-[#FDFCFB] hover:bg-[#F5F2EE] border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30"
                      }`}
                    >
                      <span
                        className={`flex items-center text-[#1A1A1A] justify-center w-8 h-8 font-mono font-bold text-xs mr-4 transition-colors ${
                          isSelected
                            ? "bg-white/10 border border-green-300"
                            : "bg-[#F5F2EE] border border-[#1A1A1A]/10"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-md font-sans font-medium">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action buttons inside the question card */}
            <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4">
              <button
                onClick={handleClearAnswer}
                disabled={!selectedAnswers[currentIndex]}
                className="text-[10px] font-sans uppercase tracking-widest font-bold text-[#d60000] hover:text-[#ff7c73] disabled:opacity-30 transition cursor-pointer"
              >
                Clear Response
              </button>

              <div className="flex items-center gap-2 font-sans">
                <span className="text-[9px] uppercase tracking-wider bg-[#F5F2EE] px-2 py-0.5 rounded-none text-[#555] border border-[#1A1A1A]/10">
                  {currentQuestion.exam} // {currentQuestion.year}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider px-2 py-0.5 border font-semibold ${
                    currentQuestion.difficulty === "Easy"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : currentQuestion.difficulty === "Medium"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Interactive Quiz Grid & Quick Stats */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Question Grid navigator */}
          <div
            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-6"
            id="quiz-navigation-grid"
          >
            <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold text-[#8C8C8C] mb-4">
              Test Ledger
            </h3>
            <div className="grid grid-cols-5 gap-2 mb-6" id="nav-btn-grid">
              {questions.map((_, idx) => {
                const isSelected = idx === currentIndex;
                const isAnswered =
                  selectedAnswers[idx] !== undefined &&
                  selectedAnswers[idx] !== null;

                return (
                  <button
                    key={idx}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`w-9 h-9 font-mono text-xs font-bold flex items-center justify-center transition border cursor-pointer ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : isAnswered
                          ? "bg-green-200 text-[#1A1A1A] border-green-300 hover:border-green-400"
                          : "bg-[#FDFCFB] text-[#8C8C8C] border-[#1A1A1A]/10 hover:bg-[#F5F2EE]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend indicators */}
            <div
              className="space-y-2.5 border-t border-[#1A1A1A]/10 pt-4 font-sans"
              id="nav-legend"
            >
              <div className="flex items-center text-[10px] uppercase tracking-wider text-[#555] gap-2">
                <span className="w-3 h-3 bg-[#1A1A1A]" />
                Active Focus
              </div>
              <div className="flex items-center text-[10px] uppercase tracking-wider text-[#555] gap-2">
                <span className="w-3 h-3 bg-green-200 border border-green-300" />
                Logged Answer
              </div>
              <div className="flex items-center text-[10px] uppercase tracking-wider text-[#555] gap-2">
                <span className="w-3 h-3 bg-[#FDFCFB] border border-[#1A1A1A]/10" />
                Unattempted
              </div>
            </div>
          </div>

          {/* Time Spent On Current Question */}
          <div
            className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-6 text-center"
            id="current-question-time"
          >
            <h4 className="text-[10px] font-sans font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">
              Time on Current Block
            </h4>
            <span className="text-3xl font-mono font-light text-[#1A1A1A]">
              {formatTime(questionTimeSpents[currentIndex] || 0)}
            </span>
            <p className="text-[10px] font-sans text-[#8C8C8C] uppercase tracking-wider mt-3 pt-3 border-t border-[#1A1A1A]/5">
              Subtopic:{" "}
              <span className="text-[#1A1A1A] font-semibold italic font-serif lowercase">
                {currentQuestion.subtopic}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Overlay/Modal */}
      {(confirmSubmit || confirmQuit) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          id="submit-modal-overlay"
        >
          <div className="bg-[#FDFCFB] border border-[#1A1A1A] p-8 max-w-md w-full shadow-2xl animate-scaleUp">
            <h3 className="text-2xl font-serif font-light italic text-[#1A1A1A] mb-3">
              {confirmSubmit
                ? "Submit Mock Exam?"
                : confirmQuit && "Are you sure want to Quit?"}
            </h3>
            <p className="text-[#555] text-xs font-sans leading-relaxed mb-8">
              You have recorded answers for{" "}
              <span className="font-bold text-[#1A1A1A]">
                {answeredCount} of {totalQuestions}
              </span>{" "}
              diagnostic items. Are you certain you want to{" "}
              {confirmSubmit
                ? "commit these solutions and review your score ledger?"
                : confirmQuit && "QUIT?"}
            </p>

            <div className="flex gap-4 justify-end font-sans">
              <button
                onClick={() => {
                  setConfirmSubmit(false);
                  setConfirmQuit(false);
                }}
                className="px-4 py-2 border border-[#1A1A1A]/20 text-[#555] hover:text-[#1A1A1A] hover:bg-[#F5F2EE] text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
              >
                Continue Test
              </button>
              <button
                onClick={
                  confirmQuit ? handleQuit : confirmSubmit && handleSubmitQuiz
                }
                className="px-5 py-2 bg-[#C2410C] hover:bg-[#1A1A1A] text-white text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
              >
                {confirmQuit
                  ? "Yes, Quit Test"
                  : confirmSubmit && "Yes, Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

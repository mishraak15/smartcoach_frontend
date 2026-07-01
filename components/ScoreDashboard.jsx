import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Award,
  Clock,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Bookmark,
  RefreshCw,
  Loader,
} from "lucide-react";

export default function ScoreDashboard({
  subject,
  topic,
  questions,
  responses,
  durationSeconds,
  onRestart,
  onStartSuggestedQuiz,
}) {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Calculate score and accuracy
  const totalQuestions = questions.length;
  const correctCount = Object.values(responses).filter(
    (r) => r.isCorrect
  ).length;

  const attemptedCount = Object.values(responses).filter(
    (r) => r.selectedOption != null
  ).length;

  const accuracyPercentage = ((correctCount / totalQuestions) * 100).toFixed(2);
  const realAccuracyPercentage = (
    (correctCount / attemptedCount) *
    100
  ).toFixed(2);

  const requiredTimePerQuestion = 40;
  const timeEfficiency = (durationSeconds / totalQuestions).toFixed(2);

  // Group by topics/subtopics to find performance metrics
  const topicStats = {};
  questions.forEach((q) => {
    const resp = responses[q.id];
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { correct: 0, total: 0, subtopic: q.subtopic };
    }
    topicStats[q.topic].total++;
    if (resp?.isCorrect) {
      topicStats[q.topic].correct++;
    }
  });

  const performances = Object.entries(topicStats).map(([topicName, stats]) => ({
    topic: topicName,
    subtopic: stats.subtopic,
    correct: stats.correct,
    total: stats.total,
    accuracy: Math.round((stats.correct / stats.total) * 100),
  }));

  // Determine weak topics (Accuracy < 60%)
  const weakPerformances = performances.filter((p) => p.accuracy < 60);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec < 10 ? "0" : ""}${sec}s`;
  };

  // Hit the backend Express endpoint to run AI analysis with Gemini
  const fetchAIAnalysis = () => {
    setAiLoading(true);
    setAiError(null);

    // Format responses for prompt
    const formattedResponses = questions.map((q) => {
      const resp = responses[q.id];
      return {
        questionText: q.question,
        topic: q.topic,
        subtopic: q.subtopic,
        selectedOption: resp?.selectedOption,
        correctOption: q.correctOption,
        isCorrect: resp?.isCorrect || false,
        timeSpentSeconds: resp?.timeSpentSeconds || 0,
      };
    });

    fetch(`${API_BASE_URL}/api/analyze-weaknesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        topic,
        responses: formattedResponses,
        totalQuestions,
        score: correctCount,
        elapsedSeconds: durationSeconds,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not complete AI analysis.");
        return res.json();
      })
      .then((data) => {
        setAiAnalysis(data);
        setAiLoading(false);
      })
      .catch((err) => {
        setAiError(err.message);
        setAiLoading(false);
      });
  };

  // Visual highlights based on final score
  const getScoreMessage = () => {
    if (accuracyPercentage >= 90) {
      return {
        title: "Pass with High Distinction",
        desc: "Outstanding comprehension across all assessed subtopics. You possess exemplary mastery of these parameters.",
        color:
          "text-[#1A1A1A] bg-[#F5F2EE] border-[#1A1A1A]/20 border-l-[#C2410C] border-l-4",
      };
    }
    if (accuracyPercentage >= 70) {
      return {
        title: "Pass with Merit",
        desc: "Solid analytical performance. Minor conceptual variations detected within secondary topics.",
        color:
          "text-[#1A1A1A] bg-[#F5F2EE] border-[#1A1A1A]/15 border-l-[#1A1A1A] border-l-4",
      };
    }
    if (accuracyPercentage >= 40) {
      return {
        title: "Pass Satisfactory",
        desc: "Diagnostic results suggest basic comprehension but trace high variance across complex subjects.",
        color:
          "text-[#1A1A1A] bg-[#F5F2EE] border-[#1A1A1A]/10 border-l-amber-600 border-l-4",
      };
    }
    return {
      title: "Revision Prescribed",
      desc: "Scores demonstrate immediate requirement for structured conceptual guidance. Target specific subtopics below.",
      color:
        "text-[#1A1A1A] bg-[#F5F2EE] border-[#1A1A1A]/10 border-l-[#C2410C] border-l-4",
    };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="max-w-5xl mx-auto py-10 px-6" id="scorecard-wrapper">
      {/* Top Welcome Title */}
      <div
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-[#1A1A1A]/10 pb-8 mb-8"
        id="dashboard-header"
      >
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8C8C] block mb-2">
            CONSOLIDATED SCHOLASTIC SCORECARD
          </span>
          <h1 className="text-4xl font-serif font-light text-[#1A1A1A]">
            Performance Ledger
          </h1>
          <p className="text-xs text-[#555] font-sans mt-2">
            Individual accuracy diagnostics, temporal logs, and custom cognitive
            feedback.
          </p>
        </div>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-[#FDFCFB] font-sans text-[10px] uppercase tracking-wider font-bold transition duration-200 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Start New Session
        </button>
      </div>

      {/* Core Summary Stats Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        id="stats-block"
      >
        <div
          className={`${
            accuracyPercentage >= 75
              ? "bg-green-100 border-green-200"
              : accuracyPercentage >= 50
              ? "bg-yellow-100 border-yellow-200"
              : "bg-red-100 border-red-200"
          }  border  px-4 py-3 flex items-center gap-5`}
        >
          <div
            className={`${
              accuracyPercentage >= 75
                ? "bg-green-200 border-green-300 text-green-600"
                : accuracyPercentage >= 50
                ? "bg-yellow-200 border-yellow-300 text-yellow-600"
                : "bg-red-200 border-red-300 text-red-600"
            } p-3  rounded-sm`}
          >
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block font-sans`}
            >
              CORRECT RESPONSES
            </span>
            <div className="text-2xl font-light font-serif text-[#1A1A1A]">
              {correctCount}{" "}
              <span className="text-sm font-sans font-normal">
                / {totalQuestions} items
              </span>
            </div>
            <div className="text-[13px] font-mono text-[#535353] mt-1">
              Overall Efficieny : {accuracyPercentage}%
            </div>
          </div>
        </div>

        <div
          className={`${
            realAccuracyPercentage >= 75
              ? "bg-green-100 border-green-200"
              : realAccuracyPercentage >= 50
              ? "bg-yellow-100 border-yellow-200"
              : "bg-red-100 border-red-200"
          }  border  px-4  py-3 flex items-center gap-5`}
        >
          <div
            className={`${
              realAccuracyPercentage >= 75
                ? "bg-green-200 border-green-300 text-green-600"
                : realAccuracyPercentage >= 50
                ? "bg-yellow-200 border-yellow-300 text-yellow-600"
                : "bg-red-200 border-red-300 text-red-600"
            } p-3  rounded-sm`}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block font-sans">
              ACCURACY ACCREDITATION
            </span>
            <div className="text-2xl font-light font-serif ">
              {realAccuracyPercentage}%
            </div>
            <div className="text-[13px] font-mono text-[#535353] mt-1">
              Correct/Attempted: {correctCount}/{attemptedCount}
            </div>
          </div>
        </div>

        <div
          className={`${
            timeEfficiency < requiredTimePerQuestion
              ? "bg-green-100 border-green-200"
              : timeEfficiency == requiredTimePerQuestion
              ? "bg-yellow-100 border-yellow-200"
              : "bg-red-100 border-red-200"
          }  border px-4 py-3 flex items-center gap-5`}
        >
          <div
            className={`${
              timeEfficiency < requiredTimePerQuestion
                ? "bg-green-200 border-green-300 text-green-600"
                : timeEfficiency == requiredTimePerQuestion
                ? "bg-yellow-200 border-yellow-300 text-yellow-600"
                : "bg-red-200 border-red-300 text-red-600"
            } p-3  rounded-sm`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px]  font-bold uppercase tracking-wider block font-sans">
              TOTAL TEMPORAL LOG
            </span>
            <div className="text-2xl font-light font-serif">
              {formatTime(durationSeconds)}
            </div>
            <div className="text-[13px] font-mono text-[#535353] mt-1">
              {timeEfficiency}sec/question
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Badge and Suggestive Guidance */}
      <div
        className={`p-6 border ${scoreMessage.color} mb-10 flex items-start gap-4`}
        id="coaching-feedback"
      >
        <Bookmark className="w-5 h-5 shrink-0 text-[#1A1A1A] mt-0.5" />
        <div>
          <h4 className="font-serif italic text-base font-semibold text-[#1A1A1A] mb-1">
            {scoreMessage.title}
          </h4>
          <p className="text-xs text-[#555] font-sans leading-relaxed">
            {scoreMessage.desc}
          </p>
        </div>
      </div>

      {/* Topics Accuracy Visual Chart & Recommendations Side-by-Side */}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12"
        id="topic-performance-layout"
      >
        {/* Left Section: Visual Recharts Chart */}
        <div
          className="lg:col-span-3 bg-[#FDFCFB] border border-[#1A1A1A]/10 p-6 flex flex-col justify-between"
          id="accuracy-chart-card"
        >
          <div>
            <h3 className="font-serif italic text-lg text-[#1A1A1A] mb-1">
              Concept Matrix Breakdown
            </h3>
            <p className="text-[#8C8C8C] text-[11px] font-sans uppercase tracking-wider mb-6">
              Subject accuracy parameters mapped relative to test standard.
            </p>
          </div>
          <div className="h-64 w-full" id="bar-chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performances}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#F5F2EE"
                />
                <XAxis
                  dataKey="topic"
                  tick={{
                    fontSize: 9,
                    fill: "#555555",
                    fontFamily: "sans-serif",
                  }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{
                    fontSize: 9,
                    fill: "#555555",
                    fontFamily: "sans-serif",
                  }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}% Accuracy`, "Metric"]}
                  contentStyle={{
                    background: "#FDFCFB",
                    border: "1px solid #1A1A1A/10",
                    fontSize: "10px",
                    fontFamily: "sans-serif",
                  }}
                />
                <Bar dataKey="accuracy" maxBarSize={30}>
                  {performances.map((entry, index) => {
                    const color =
                      entry.accuracy >= 70
                        ? "#1A1A1A"
                        : entry.accuracy >= 40
                        ? "#C2410C"
                        : "#8C8C8C";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Section: Weak Topics and Suggestions */}
        <div
          className="lg:col-span-2 bg-[#F5F2EE] border border-[#1A1A1A]/10 p-6 flex flex-col justify-between"
          id="suggestions-card"
        >
          <div>
            <div className="flex items-center gap-2 text-[#C2410C] mb-2">
              <TrendingDown className="w-4 h-4" />
              <h3 className="font-serif text-lg font-light text-[#1A1A1A]">
                Subtopic Directives
              </h3>
            </div>
            <p className="text-xs text-[#555] font-sans leading-relaxed mb-6">
              Immediate remedial exercises recommended based on incorrect
              entries.
            </p>

            {weakPerformances.length > 0 ? (
              <div className="space-y-4 mb-6">
                {weakPerformances.map((perf) => (
                  <div
                    key={perf.topic}
                    className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif italic text-sm text-[#1A1A1A]">
                        {perf.topic}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#C2410C] bg-[#C2410C]/5 px-2 py-0.5 border border-[#C2410C]/10">
                        {perf.accuracy}% ACC
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8C8C8C] font-sans uppercase tracking-wider mb-3">
                      Subtopic: {perf.subtopic}
                    </p>
                    <button
                      onClick={() => onStartSuggestedQuiz(subject, perf.topic)}
                      className="inline-flex items-center gap-1.5 text-[10px] font-sans font-bold text-[#1A1A1A] hover:text-[#C2410C] uppercase tracking-wider transition cursor-pointer"
                    >
                      Begin Topic Quiz <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#FDFCFB] border border-emerald-600/20 p-4 mb-6 text-[#1A1A1A] text-center">
                <p className="font-serif italic text-sm mb-1">
                  Excellent Preparation!
                </p>
                <p className="text-xs text-[#555] font-sans">
                  All subject scores are above 60%. Highly competent parameters
                  verified.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-[#1A1A1A]/10 pt-5 mt-4">
            <p className="text-[10px] text-[#8C8C8C] font-sans uppercase tracking-wider mb-3">
              Generate bespoke scholastic reviews and practice steps via our
              cognitive coach.
            </p>
            <button
              onClick={fetchAIAnalysis}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] disabled:bg-[#8C8C8C] text-[#FDFCFB] font-sans text-[10px] uppercase tracking-widest font-bold transition duration-200 cursor-pointer"
            >
              {aiLoading ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" /> Compiling
                  report...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Consult
                  Gemini Coach
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Gemini Coach AI Box (Shows conditionally when fetched) */}
      {aiLoading && (
        <div
          className="bg-[#F5F2EE] border border-[#1A1A1A]/10 p-8 text-center mb-12 animate-pulse"
          id="ai-coaching-loading"
        >
          <Loader className="w-8 h-8 text-[#8C8C8C] animate-spin mx-auto mb-4" />
          <h4 className="font-serif text-lg text-[#1A1A1A] mb-1">
            Compiling AI Evaluation Dossier
          </h4>
          <p className="text-[#8C8C8C] font-sans text-xs uppercase tracking-widest max-w-sm mx-auto mt-2">
            Analyzing timing, error patterns, and cognitive parameters...
          </p>
        </div>
      )}

      {aiError && (
        <div
          className="bg-[#FDFCFB] border border-[#C2410C]/20 p-6 text-center text-[#C2410C] mb-12"
          id="ai-coaching-error"
        >
          <p className="font-serif italic text-base mb-1">
            Dossier Compilation Failed
          </p>
          <p className="text-xs font-sans text-[#555] mb-3">{aiError}</p>
          <button
            onClick={fetchAIAnalysis}
            className="text-xs font-sans uppercase tracking-widest underline font-bold"
          >
            Re-submit request
          </button>
        </div>
      )}

      {aiAnalysis && (
        <div
          className="bg-[#1A1A1A] text-white border border-[#1A1A1A] p-8 md:p-10 mb-12 relative overflow-hidden"
          id="ai-coach-report"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-serif italic text-xl tracking-tight">
                AI Coach Advisory Dossier
              </h3>
            </div>

            <div className="mb-8">
              <h5 className="text-[10px] font-sans font-bold text-amber-400 uppercase tracking-[0.2em] mb-3">
                Performance Insight & Syntheses
              </h5>
              <p className="text-slate-300 font-serif font-light text-sm md:text-base leading-relaxed whitespace-pre-line">
                {aiAnalysis.insights}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {aiAnalysis.learningTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between"
                >
                  <div>
                    <h6 className="font-serif italic text-amber-300 text-sm mb-2">
                      {tip.area}
                    </h6>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed mb-4">
                      {tip.description}
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-none text-[10px] font-sans text-white/90 flex items-start gap-2">
                    <span className="text-amber-300 font-bold tracking-wider">
                      ACTION:
                    </span>
                    <span>{tip.actionableStep}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 border border-amber-300/20 p-6 flex items-start gap-4">
              <BookOpen className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h6 className="font-serif italic text-amber-300 text-sm mb-1">
                  Prescribed Next Concept Focus
                </h6>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {aiAnalysis.recommendedFocus}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Question Review List */}
      <div id="quiz-review-section">
        <h3 className="font-serif text-2xl text-[#1A1A1A] mb-8">
          Itemized Review Ledger
        </h3>
        <div className="space-y-6">
          {questions.map((q, idx) => {
            const resp = responses[q.id];
            const isCorrect = resp?.isCorrect || false;
            const selected = resp?.selectedOption || "Skipped";

            return (
              <div
                key={q.id}
                className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-3 md:p-8 relative overflow-hidden"
              >
                {/* Visual side band for pass/fail */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isCorrect ? "bg-[#1A1A1A]" : "bg-[#C2410C]"
                  }`}
                />

                <div className="flex items-start justify-between gap-4 mb-4 flex-col sm:flex-row">
                  <div className="w-full sm:w-[50%] flex items-center gap-3">
                    <span className="font-serif font-light italic text-[#8C8C8C] text-2xl">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </span>
                    <span className="text-[10px] font-sans uppercase tracking-widest text-[#555] bg-[#F5F2EE] border border-[#1A1A1A]/15 px-2.5 py-1">
                      {q.topic} › {q.subtopic}
                    </span>
                  </div>
                  <div className="sm:w-[50%] w-full self-end flex gap-6 items-center justify-end">
                    <div
                      className={`flex items-center gap-2 font-mono text-xs font-bold p-2 md:px-4 border 
                        ${
                          resp.timeSpentSeconds > requiredTimePerQuestion
                            ? "text-rose-600 bg-rose-50 border-rose-300"
                            : "text-green-600 bg-green-50 border-green-300"
                        }
                        
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {resp?.timeSpentSeconds >= 60
                          ? formatTime(resp.timeSpentSeconds)
                          : resp.timeSpentSeconds + "s" || "0s"}
                      </span>
                    </div>
                    {isCorrect ? (
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-sans uppercase tracking-wider text-green-800 font-bold">
                        [ Correct ]
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-sans uppercase tracking-wider text-[#C2410C] font-bold">
                        {resp?.selectedOption ? "[ Incorrect ]" : "[ Skipped ]"}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[#1A1A1A] font-serif text-base leading-relaxed mb-6 whitespace-pre-wrap">
                  {q.question}
                </p>

                {/* Answers status box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {q.options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border text-xs font-sans flex flex-col  justify-center ${
                        option == selected && isCorrect
                          ? "bg-green-100 border-green-200 text-[#1A1A1A]"
                          : option == selected &&
                            !isCorrect &&
                            resp?.selectedOption
                          ? "bg-red-100 border-red-300 text-[#C2410C]"
                          : option == q.correctOption
                          ? "border-green-300"
                          : "border border-[#1A1A1A]/15 bg-[#F5F2EE]/50 text-[#1A1A1A]"
                      }`}
                    >
                      {(option == q.correctOption || option == selected) && (
                        <span
                          className={`${
                            option == q.correctOption
                              ? "text-green-800"
                              : "text-[#8C8C8C]"
                          } text-[9px] text-[#8C8C8C] block font-bold uppercase tracking-wider mb-1`}
                        >
                          {option == q.correctOption
                            ? "Correct Choice"
                            : "Your Registered Choice"}
                        </span>
                      )}
                      <p className="font-semibold">{option}</p>
                    </div>
                  ))}
                </div>

                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    className={`p-4 border text-xs font-sans ${
                      isCorrect
                        ? "bg-green-100 border-green-200 text-[#1A1A1A]"
                        : "bg-[#C2410C]/5 border-[#C2410C]/15 text-[#C2410C]"
                    }`}
                  >
                    <span className="text-[9px] text-[#8C8C8C] block font-bold uppercase tracking-wider mb-1">
                      Your Registered Choice
                    </span>
                    <p className="font-semibold">{selected}</p>
                  </div>

                  {!isCorrect && (
                    <div className="p-4 border border-[#1A1A1A]/15 bg-[#F5F2EE]/50 text-[#1A1A1A] text-xs font-sans">
                      <span className="text-[9px] text-[#8C8C8C] block font-bold uppercase tracking-wider mb-1">
                        Correct Choice
                      </span>
                      <p className="font-semibold">{q.correctOption}</p>
                    </div>
                  )}
                </div> */}

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-[#F5F2EE]/40 border border-[#1A1A1A]/5 p-5 text-xs font-sans text-[#555] flex items-start gap-3">
                    <HelpCircle className="w-4 h-4 text-[#1A1A1A] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-sans font-bold text-[#1A1A1A] text-[9px] block uppercase tracking-wider mb-1">
                        Explanatory Note
                      </span>
                      <p className="leading-relaxed whitespace-pre-wrap">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { X, Check, Database, Loader, Sparkles } from "lucide-react";
import { API_BASE_URL } from "../config.js";

export default function AdminPortal({ onClose, onQuestionAdded }) {
  const [adminPass, setAdminPass] = useState("");
  const [formData, setFormData] = useState({
    question: "",
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctOption: "",
    subject: "English",
    customSubject: "",
    topic: "",
    subtopic: "",
    year: new Date().getFullYear(),
    exam: "SSC CGL",
    shift: "Shift 1",
    difficulty: "Medium",
    explanation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const handleGenerateAI = async () => {
    setError(null);
    if (!formData.question.trim()) {
      setError(
        "Please fill in the Question Description before generating an explanation."
      );
      return;
    }
    const options = [
      formData.optA,
      formData.optB,
      formData.optC,
      formData.optD,
    ].map((o) => o.trim());
    if (options.some((o) => o === "")) {
      setError(
        "Please fill in all 4 options (A, B, C, D) before generating an explanation."
      );
      return;
    }
    if (!formData.correctOption) {
      setError(
        "Please select the correct option before generating an explanation."
      );
      return;
    }

    setGeneratingAi(true);
    const selectedSubject =
      formData.subject === "Custom"
        ? formData.customSubject.trim()
        : formData.subject;

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-explanation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: formData.question.trim(),
          options,
          correctOption: formData.correctOption.trim(),
          subject: selectedSubject,
          topic: formData.topic.trim(),
          subtopic: formData.subtopic.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI explanation.");
      }

      setFormData((prev) => ({
        ...prev,
        explanation: data.explanation || "",
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate options
    const options = [
      formData.optA,
      formData.optB,
      formData.optC,
      formData.optD,
    ].map((o) => o.trim());
    if (options.some((o) => o === "")) {
      setError("Please fill in all 4 options (A, B, C, D).");
      return;
    }

    if (!formData.correctOption) {
      setError("Please specify which option is correct.");
      return;
    }

    const selectedSubject =
      formData.subject === "Custom"
        ? formData.customSubject.trim()
        : formData.subject;
    if (!selectedSubject) {
      setError("Please specify a subject domain.");
      return;
    }

    setLoading(true);

    const payload = {
      question: formData.question.trim(),
      options: options,
      correctOption: formData.correctOption.trim(),
      subject: selectedSubject,
      topic: formData.topic.trim() || "General Practice",
      subtopic: formData.subtopic.trim() || "Mock Test",
      year: Number(formData.year) || new Date().getFullYear(),
      exam: formData.exam.trim() || "Practice Exam",
      shift: formData.shift.trim() || "Shift 1",
      difficulty: formData.difficulty,
      explanation: formData.explanation.trim(),
    };

    fetch(`${API_BASE_URL}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Failed to submit new question.");
        return data;
      })
      .then(() => {
        setSuccess(true);
        setLoading(false);
        onQuestionAdded();
        // Reset form
        setFormData({
          question: "",
          optA: "",
          optB: "",
          optC: "",
          optD: "",
          correctOption: "",
          subject: "English",
          customSubject: "",
          topic: "",
          subtopic: "",
          year: new Date().getFullYear(),
          exam: "SSC CGL",
          shift: "Shift 1",
          difficulty: "Medium",
          explanation: "",
        });
        onClose();
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const matchPass = (enteredPass) => {
    setAdminPass(enteredPass);
    if (enteredPass != import.meta.env.VITE_ADMIN_PASS)
      setError("Wrong Pass!! Try Again");
    else setError(null);
  };

  return (
    <>
      {adminPass != import.meta.env.VITE_ADMIN_PASS ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          id="admin-portal-wrapper"
        >
          <div
            className="bg-white w-[90%] h-[90%] lg:h-fit lg:w-1/2 rounded-sm shadow-2xl flex flex-col gap-5 overflow-x-hidden animate-slideLeft p-4"
            id="admin-drawer"
          >
            <button
              onClick={onClose}
              className="p-1.5 w-fit self-end cursor-pointer hover:bg-slate-200/60 rounded-sm text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h1 className="font-bold font-sans text-3xl text-center ">
              Are you Admin?
            </h1>

            {error && (
              <div className="flex justify-between gap-2 py-2.5 px-4 bg-rose-50 border border-rose-100 rounded-sm text-xs font-medium text-rose-700 font-mono">
                <div>{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="self-start cursor-pointer text-rose-700 rounded-sm hover:text-rose-900 transition "
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="password"
              name="adminpass"
              id="adminpass"
              className="py-2 px-4 border-2 text-sm border-gray-200 rounded-[2px] mt-3 outline-none placeholder:text-gray-900"
              placeholder="Enter admin password"
              onInput={(e) => {
                matchPass(e.target.value);
              }}
            />
            <button
              className="outline-none py-1 px-8 cursor-pointer w-fit self-end bg-blue-200 hover:bg-blue-100 rounded-[2px] text-gray-700 border-[1px] border-blue-300"
              onClick={() => matchPass(adminPass)}
            >
              Enter
            </button>
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-sm p-4"
          id="admin-portal-wrapper"
        >
          <div
            className="bg-white h-full max-w-xl w-full rounded-sm md:rounded-r-none md:rounded-l-3xl shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
            id="admin-drawer"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-indigo-600">
                <Database className="w-5 h-5" />
                <h2 className="font-display font-bold text-lg text-slate-800">
                  Add Mock Exam Question
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-200/60 rounded-sm text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-5"
              id="admin-form"
            >
              {error && (
                <div className="flex sticky top-0 justify-between gap-2 py-2.5 px-4 bg-rose-50 border border-rose-100 rounded-sm text-xs font-medium text-rose-700 font-mono">
                  <div className="w-[90%]">{error}</div>
                  <button
                    onClick={() => setError(null)}
                    className="self-start cursor-pointer text-rose-700 rounded-sm hover:text-rose-900 transition "
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-sm text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Successfully injected question
                  into local database!
                </div>
              )}

              {/* Subject Selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full text-sm border border-slate-200 hover:border-slate-300 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="General Awareness">General Awareness</option>
                    <option value="Custom">Custom Domain</option>
                  </select>
                </div>

                {formData.subject === "Custom" && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Custom Subject Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. History"
                      required
                      value={formData.customSubject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customSubject: e.target.value,
                        })
                      }
                      className="w-full text-sm border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                    className="w-full text-sm border border-slate-200 hover:border-slate-300 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Primary Topic
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vocabulary"
                    required
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                    className="w-full text-sm border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Subtopic / Concept
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. One Word Substitution"
                    required
                    value={formData.subtopic}
                    onChange={(e) =>
                      setFormData({ ...formData, subtopic: e.target.value })
                    }
                    className="w-full text-sm border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Question Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter the full question prompt text..."
                  required
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  className="w-full text-sm border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Options Grid */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-sm border border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Configure Answer Options
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  <input
                    type="text"
                    placeholder="Option A (required)"
                    required
                    value={formData.optA}
                    onChange={(e) =>
                      setFormData({ ...formData, optA: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Option B (required)"
                    required
                    value={formData.optB}
                    onChange={(e) =>
                      setFormData({ ...formData, optB: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Option C (required)"
                    required
                    value={formData.optC}
                    onChange={(e) =>
                      setFormData({ ...formData, optC: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Option D (required)"
                    required
                    value={formData.optD}
                    onChange={(e) =>
                      setFormData({ ...formData, optD: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-500 block mb-1">
                    Select the Correct Option Text
                  </label>
                  <select
                    required
                    value={formData.correctOption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correctOption: e.target.value,
                      })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 bg-white text-slate-700 outline-none"
                  >
                    <option value="">-- Choose correct option --</option>
                    {formData.optA.trim() && (
                      <option value={formData.optA}>{formData.optA}</option>
                    )}
                    {formData.optB.trim() && (
                      <option value={formData.optB}>{formData.optB}</option>
                    )}
                    {formData.optC.trim() && (
                      <option value={formData.optC}>{formData.optC}</option>
                    )}
                    {formData.optD.trim() && (
                      <option value={formData.optD}>{formData.optD}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Exam
                  </label>
                  <input
                    type="text"
                    placeholder="SSC CGL"
                    value={formData.exam}
                    onChange={(e) =>
                      setFormData({ ...formData, exam: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Shift
                  </label>
                  <input
                    type="text"
                    placeholder="Shift 1"
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                    Concept Explanation
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAI}
                    disabled={generatingAi}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-100 hover:bg-indigo-50 border-[1px] border-indigo-300 disabled:bg-slate-100 disabled:text-slate-400 px-2.5 py-1 rounded-sm transition border border-indigo-100/30 disabled:border-transparent cursor-pointer"
                  >
                    {generatingAi ? (
                      <>
                        <Loader className="w-3 h-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3" />
                        Generate via AI
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Provide a detailed conceptual step explanation..."
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  className="w-full text-sm border border-slate-200 rounded-sm px-3 py-2 text-slate-700 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-sm text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-sm text-sm transition hover:shadow cursor-pointer"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Save Question"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

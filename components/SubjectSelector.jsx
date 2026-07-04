import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calculator,
  BrainCircuit,
  Compass,
  Award,
  PlusCircle,
  ArrowRight,
  Loader,
} from "lucide-react";

export default function SubjectSelector({
  onSelectCategory,
  onOpenAdmin,
  selectedSubject,
  setSelectedSubject,
  tenQuesMode,
  setTenQuesMode,
}) {
  const [subjects, setSubjects] = useState([{}]);

  const [topics, setTopics] = useState([{ topic: "", count: "" }]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load exam subjects.");
        res.json().then((result) => {
          setSubjects(result);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/${selectedSubject}/topics`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load topics.");
          res.json().then((result) => {
            setTopics(result);
            setTenQuesMode(true);
            setLoading(false);
          });
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [selectedSubject]);

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case "english":
        return <BookOpen className="w-5 h-5 text-[#1A1A1A]" />;
      case "mathematics":
        return <Calculator className="w-5 h-5 text-[#1A1A1A]" />;
      case "reasoning":
        return <BrainCircuit className="w-5 h-5 text-[#1A1A1A]" />;
      default:
        return <Compass className="w-5 h-5 text-[#1A1A1A]" />;
    }
  };

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-100"
        id="loading-container"
      >
        <Loader className="w-8 h-8 text-[#8C8C8C] animate-spin mb-4" />
        <p className="text-[#8C8C8C] font-sans text-xs uppercase tracking-widest">
          Loading exam report modules...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-[#FDFCFB] border border-[#C2410C]/20 rounded-none p-8 text-center max-w-lg mx-auto my-12"
        id="error-container"
      >
        <p className="text-[#C2410C] font-serif italic text-lg mb-2">
          Failed to retrieve exam reports
        </p>
        <p className="text-xs font-sans text-[#8C8C8C] mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-[#FDFCFB] font-sans text-[10px] uppercase tracking-wider font-bold transition duration-200"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div
      className="max-w-4xl mx-auto p-2 sm:py-3 sm:px-6 "
      id="selector-wrapper"
    >
      <div className="text-center mb-4 border-b border-[#1A1A1A]/10">
        <span className="text-[10px] uppercase tracking-[0.25em] font-sans font-bold text-[#8C8C8C]">
          Assessment Modules / Official Revision
        </span>
        <h2 className="text-4xl md:text-5xl font-light font-serif tracking-tight text-[#1A1A1A] my-3 italic">
          Select Practice Domain
        </h2>
        <p className="font-sans text-sm text-[#555] max-w-xl mx-auto leading-relaxed mb-3">
          Prepare for standard SSC CGL mock examinations with high-yield
          assessment blocks. Select a general subject area to reveal tailored
          revision reports.
        </p>
      </div>

      {!selectedSubject ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          id="subject-grid"
        >
          {subjects.map((subj) => {
            return (
              <div
                key={subj?.subject}
                id={`subject-card-${subj?.subject?.toLowerCase()}`}
                onClick={() => setSelectedSubject(subj?.subject)}
                className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-4 sm:p-6 cursor-pointer hover:bg-[#F5F2EE] hover:border-[#1A1A1A]/30 transition-all duration-300 relative group flex flex-col justify-between min-h-55"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#F5F2EE] border border-[#1A1A1A]/10 rounded-none">
                    {getSubjectIcon(subj?.subject)}
                  </div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#8C8C8C] border border-[#1A1A1A]/10 px-2.5 py-1 bg-[#FDFCFB]">
                    {subj?.count} questions
                  </span>
                </div>
                <h3 className="text-2xl font-normal font-serif text-[#1A1A1A] mb-2 group-hover:text-[#C2410C] transition-colors">
                  {subj?.subject}
                </h3>
                <p className="text-xs font-sans text-[#555] leading-relaxed mb-3">
                  Analyze exam metrics for multiple fields of study
                </p>
                <div className="flex items-center text-[10px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors pt-2 border-t border-[#1A1A1A]/5">
                  Browse Module Topics{" "}
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-3 md:p-8 mb-5"
          id="topics-panel"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#1A1A1A]/10 pb-6 mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#F5F2EE] border border-[#1A1A1A]/10">
                {getSubjectIcon(selectedSubject)}
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-widest font-sans text-[#8C8C8C]">
                  Report Target
                </span>
                <h2 className="text-3xl font-light font-serif italic text-[#1A1A1A]">
                  {selectedSubject}
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedSubject(null)}
                className="font-sans text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#F5F2EE] text-[#555] hover:text-[#1A1A1A] px-4 py-2 transition self-start sm:self-auto cursor-pointer"
              >
                ← All Modules
              </button>
              <button
                onClick={() => setTenQuesMode((pre) => !pre)}
                className={`font-sans text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A]/20  text-[#555]  px-4 py-2 transition self-start sm:self-auto duration-200 cursor-pointer ${tenQuesMode ? "bg-[#C2410C] text-white" : "hover:text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#F5F2EE]"} `}
              >
                10 Ques Mode
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() => onSelectCategory(selectedSubject, null)}
              className="flex items-center justify-between p-3 md:p-6 bg-[#1A1A1A] text-white cursor-pointer hover:bg-[#C2410C] transition duration-200 group"
              id="full-domain-test-btn"
            >
              <div>
                <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#8C8C8C]">
                  Diagnostic Unit
                </span>
                <h4 className="font-serif text-xl font-normal text-white mt-1">
                  Full Practice Paper
                </h4>
                <p className="text-xs font-sans text-slate-300 mt-1">
                  10 random questions from all topic headers
                </p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-none group-hover:scale-105 transition-transform">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>

            {topics.map((t) => (
              <div
                key={t.topic}
                onClick={() => onSelectCategory(selectedSubject, t.topic)}
                className="flex items-center justify-between p-3 md:p-6 bg-[#FDFCFB] border border-[#1A1A1A]/10 hover:bg-[#F5F2EE] hover:border-[#1A1A1A]/30 cursor-pointer transition duration-200 group"
              >
                <div>
                  <span className="text-[9px] font-sans uppercase tracking-[0.2em] text-[#8C8C8C]">
                    Topic Code
                  </span>
                  <h4 className="font-serif text-lg font-normal text-[#1A1A1A] group-hover:text-[#C2410C] mt-1 transition-colors">
                    {t.topic}
                  </h4>
                  <p className="text-xs font-sans text-[#555] mt-1">
                    {t.count} practice records in ledger
                  </p>
                </div>
                <div className="p-2 border border-[#1A1A1A]/10 bg-[#F5F2EE] group-hover:border-[#1A1A1A]/30 transition-all">
                  <ArrowRight className="w-3 h-3 text-[#1A1A1A]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Database Management / Admin Entry */}
      <div
        className="border-t border-[#1A1A1A]/10 pt-10 text-center"
        id="admin-prompt"
      >
        <p className="text-xs font-sans text-[#8C8C8C] mb-6 uppercase tracking-wider">
          Are you an examiner? Append questions to the active test database.
        </p>
        <button
          onClick={onOpenAdmin}
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FDFCFB] text-[#1A1A1A] font-sans text-[10px] uppercase tracking-[0.2em] font-bold transition duration-200 cursor-pointer"
          id="open-admin-btn"
        >
          <PlusCircle className="w-4 h-4" />
          Add Question to Database
        </button>
      </div>
    </div>
  );
}

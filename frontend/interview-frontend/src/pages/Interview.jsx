import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { fetchQuestions, submitAnswer, saveAttempt, startAttempt } from "../services/api";

function Interview() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [scores, setScores] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const answerRef = useRef(answer);
  answerRef.current = answer;

  // Initialize questions and attempt session
  useEffect(() => {
    let isMounted = true;
    const initInterview = async () => {
      try {
        setLoading(true);
        const qData = await fetchQuestions();
        if (!isMounted) return;

        if (!Array.isArray(qData) || qData.length === 0) {
          setError("No interview questions found in question bank. Please ask admin to add questions.");
          setLoading(false);
          return;
        }

        setQuestions(qData);

        // Start session
        const candidateName = localStorage.getItem("candidateName") || "Candidate";
        const role = localStorage.getItem("role") || "user";
        const attemptRes = await startAttempt({
          candidate_name: candidateName,
          user_role: role,
          total_questions: qData.length,
        });

        if (isMounted) {
          setAttemptId(attemptRes.attempt_id);
          localStorage.setItem("lastAttemptId", attemptRes.attempt_id);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to connect to the backend server. Make sure Laravel API is running: " + err.message);
          setLoading(false);
        }
      }
    };

    initInterview();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnswerSubmit = useCallback(async () => {
    if (submitting || questions.length === 0 || !questions[current]) return;

    setSubmitting(true);
    const q = questions[current];
    const currentAnswer = answerRef.current;

    try {
      const res = await submitAnswer({
        question_id: q.id,
        answer: currentAnswer.trim() || "(No answer provided within time limit)",
        attempt_id: attemptId,
        user_role: localStorage.getItem("role") || "user",
      });

      const updatedScores = [...scores, res.score || 0];
      setScores(updatedScores);
      setAnswer("");
      setTimeLeft(30);

      if (current + 1 >= questions.length) {
        const finalScore = updatedScores.reduce((a, b) => a + b, 0);
        localStorage.setItem("finalScore", finalScore);

        await saveAttempt({
          attempt_id: attemptId,
          score: finalScore,
          total_questions: questions.length,
          candidate_name: localStorage.getItem("candidateName") || "Candidate",
        });

        navigate("/result");
      } else {
        setCurrent((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Submission error:", err);
      // Fallback advance on error
      if (current + 1 >= questions.length) {
        navigate("/result");
      } else {
        setCurrent((prev) => prev + 1);
        setAnswer("");
        setTimeLeft(30);
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, questions, current, scores, attemptId, navigate]);

  // Live 30s countdown timer
  useEffect(() => {
    if (questions.length === 0 || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAnswerSubmit();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, questions.length, loading, handleAnswerSubmit]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>⏳</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Loading Interview Questions...</h2>
          <p style={{ color: "#94a3b8", marginTop: "8px" }}>Connecting to AI Interview Engine</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: "600px", margin: "60px auto", padding: "30px", textAlign: "center" }} className="glass-card">
          <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ fontSize: "1.3rem", color: "#fb7185", marginBottom: "12px" }}>Interview Setup Notice</h2>
          <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </button>
        </div>
      </>
    );
  }

  const currentQ = questions[current];
  const progressPercent = ((current + 1) / questions.length) * 100;
  const timerColor = timeLeft > 10 ? "#06b6d4" : timeLeft > 5 ? "#f59e0b" : "#f43f5e";

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 20px" }}>
        {/* Progress Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="badge badge-purple">{currentQ.skill || "Technical"}</span>
            <span style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: "600" }}>
              Question {current + 1} of {questions.length}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "1.1rem" }}>⏱️</span>
            <span style={{ fontWeight: "800", fontSize: "1.1rem", color: timerColor }}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Timer Bar */}
        <div className="timer-container">
          <div
            className="timer-bar"
            style={{
              width: `${(timeLeft / 30) * 100}%`,
              backgroundColor: timerColor,
            }}
          />
        </div>

        {/* Question Card */}
        <div className="glass-card" style={{ padding: "36px", marginTop: "24px" }}>
          <h2 style={{ fontSize: "1.35rem", lineHeight: "1.5", color: "#f8fafc", marginBottom: "24px" }}>
            {currentQ.question}
          </h2>

          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "600" }}>
                YOUR TECHNICAL RESPONSE
              </label>
              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {answer.length} characters
              </span>
            </div>

            <textarea
              rows="6"
              placeholder="Explain your approach, key terminology, and implementation considerations..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              style={{ resize: "vertical", minHeight: "130px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", flexWrap: "wrap", gap: "14px" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Tip: The question automatically submits when the timer reaches 0.
            </span>

            <button
              className="btn-primary"
              onClick={handleAnswerSubmit}
              disabled={submitting}
              style={{ minWidth: "160px" }}
            >
              {submitting ? "Evaluating..." : current + 1 === questions.length ? "Finish & View Results 🏆" : "Submit & Next →"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default Interview;

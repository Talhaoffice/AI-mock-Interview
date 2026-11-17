import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchResults } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Result() {
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const attemptId = localStorage.getItem("lastAttemptId");
  const candidateName = localStorage.getItem("candidateName") || "Candidate";

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await fetchResults(attemptId);
        setResultData(data);
      } catch (err) {
        console.error("Failed to load results:", err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [attemptId]);

  const skillBreakdown = resultData?.skill_breakdown || [];
  const detailedAnswers = resultData?.detailed_answers || [];
  const totalScore = resultData?.total_score || localStorage.getItem("finalScore") || 0;

  // Chart config
  const chartData = {
    labels: skillBreakdown.map((s) => s.skill),
    datasets: [
      {
        label: "Total Score by Skill",
        data: skillBreakdown.map((s) => s.total_score),
        backgroundColor: "rgba(6, 182, 212, 0.75)",
        borderColor: "#06b6d4",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { family: "'Plus Jakarta Sans', sans-serif" },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
    },
  };

  const downloadPDF = () => {
    setDownloading(true);
    const input = document.getElementById("result-card");

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#090d16",
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${candidateName.replace(/\s+/g, "_")}_Interview_Report.pdf`);
      })
      .catch((err) => console.error("PDF generation error:", err))
      .finally(() => setDownloading(false));
  };

  // Performance Evaluation Tier
  const getPerformanceBadge = (score) => {
    if (score >= 40) return { label: "Exceptional / Senior Ready", color: "badge-emerald" };
    if (score >= 25) return { label: "Proficient / Mid-Level", color: "badge-cyan" };
    if (score >= 12) return { label: "Promising / Junior Level", color: "badge-purple" };
    return { label: "Foundational / Needs Practice", color: "badge-rose" };
  };

  const tier = getPerformanceBadge(totalScore);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📊</div>
          <h2>Compiling Interview Analytics...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main style={{ maxWidth: "960px", margin: "40px auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc" }}>
              Interview Performance Report
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              Detailed breakdown of candidate evaluation and AI remarks
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-secondary" onClick={() => navigate("/interview")}>
              🔄 Retake Interview
            </button>
            <button className="btn-primary" onClick={downloadPDF} disabled={downloading}>
              {downloading ? "Exporting PDF..." : "📥 Download Official PDF"}
            </button>
          </div>
        </div>

        {/* Exportable Container */}
        <div id="result-card" className="glass-card" style={{ padding: "36px", background: "#0b1120" }}>
          {/* Header Summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "24px", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                CANDIDATE NAME
              </p>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f8fafc" }}>
                {candidateName}
              </h2>
              <div style={{ marginTop: "8px" }}>
                <span className={`badge ${tier.color}`}>{tier.label}</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                AGGREGATE SCORE
              </p>
              <h2 style={{ fontSize: "2.8rem", fontWeight: "800", color: "#06b6d4", lineHeight: "1" }}>
                {totalScore}
              </h2>
            </div>
          </div>

          {/* Skill Analytics Chart */}
          {skillBreakdown.length > 0 && (
            <div style={{ marginTop: "32px", marginBottom: "32px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "#f8fafc" }}>
                Domain Competency Breakdown
              </h3>
              <div style={{ height: "260px" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Detailed Question Reviews */}
          {detailedAnswers.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", color: "#f8fafc" }}>
                Question-by-Question Evaluation & AI Remarks
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {detailedAnswers.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "20px",
                      borderRadius: "12px",
                      background: "rgba(15, 23, 42, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <span className="badge badge-purple">{item.skill || "Technical"}</span>
                      <span style={{ fontWeight: "700", color: "#06b6d4", fontSize: "0.95rem" }}>
                        Score: {item.score} / 10
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1rem", fontWeight: "600", color: "#e2e8f0", marginTop: "10px" }}>
                      Q{idx + 1}: {item.question}
                    </h4>

                    <div style={{ marginTop: "12px", padding: "12px", background: "rgba(0,0,0,0.25)", borderRadius: "8px" }}>
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "600", marginBottom: "4px" }}>
                        YOUR ANSWER:
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                        {item.answer || "No response provided."}
                      </p>
                    </div>

                    {item.feedback && (
                      <div style={{ marginTop: "12px", padding: "12px", background: "rgba(6, 182, 212, 0.08)", borderLeft: "3px solid #06b6d4", borderRadius: "0 8px 8px 0" }}>
                        <p style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: "700", marginBottom: "4px" }}>
                          💡 AI EVALUATION REMARK:
                        </p>
                        <p style={{ fontSize: "0.85rem", color: "#e0f2fe", lineHeight: "1.4" }}>
                          {item.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Result;

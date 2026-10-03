const BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export const fetchQuestions = async () => {
  const res = await fetch(`${BASE_URL}/questions`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
};

export const startAttempt = async (data = {}) => {
  const res = await fetch(`${BASE_URL}/start-attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to start attempt");
  return res.json();
};

export const submitAnswer = async (data) => {
  const res = await fetch(`${BASE_URL}/submit-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit answer");
  return res.json();
};

export const saveAttempt = async (data) => {
  const res = await fetch(`${BASE_URL}/save-attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save attempt");
  return res.json();
};

export const fetchResults = async (attemptId = null) => {
  const url = attemptId
    ? `${BASE_URL}/results?attempt_id=${encodeURIComponent(attemptId)}`
    : `${BASE_URL}/results`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
};

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${BASE_URL}/upload-resume`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload and parse resume");
  return res.json();
};

export const createQuestion = async (data) => {
  const res = await fetch(`${BASE_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create question");
  return res.json();
};

export const updateQuestion = async (id, data) => {
  const res = await fetch(`${BASE_URL}/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update question");
  return res.json();
};

export const deleteQuestion = async (id) => {
  const res = await fetch(`${BASE_URL}/questions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete question");
  return res.json();
};

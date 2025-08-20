import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import { FaCode, FaGithub, FaCheckCircle, FaTimes } from "react-icons/fa";

function App() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    gitcode: "",
  });
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEvaluation(null);

    try {
      const res = await axios.post("/api/evaluate", formData);
      setEvaluation(res.data);
    } catch (err) {
      setError("Failed to get evaluation. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="card-container">
          {/* Header with gradient border */}
          <div className="card-header">
            <div className="header-content">
              <div className="header-icon">
                <FaCode />
              </div>
              <div className="header-text">
                <h1>Project Completion AI Evaluator</h1>
                <p>Submit your project details for AI evaluation</p>
              </div>
            </div>
          </div>

          <div className="card-body">
            {error && (
              <div className="error-message">
                <FaTimes className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="evaluation-form">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    Project Title <span className="required">*</span>
                  </label>
                  <div className="input-container">
                    <input
                      id="title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter the title of your project"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Project Description <span className="required">*</span>
                  </label>
                  <div className="input-container">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Describe your project in detail"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-header">
                  <FaGithub />
                  <h4>Code Repository</h4>
                </div>

                <div className="form-group">
                  <label htmlFor="gitcode" className="form-label">
                    GitHub Repository URL <span className="required">*</span>
                  </label>
                  <div className="input-container">
                    <textarea
                      id="gitcode"
                      name="gitcode"
                      value={formData.gitcode}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Enter GitHub repository URL or paste code snippets"
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Evaluating..." : "Evaluate Project"}
                </button>
              </div>
            </form>

            {evaluation && (
              <div className="evaluation-result">
                <div className="result-header">
                  <FaCheckCircle className="result-icon" />
                  <h2>Evaluation Result</h2>
                </div>

                <div className="completion-section">
                  <p className="completion-label">Project Completion:</p>
                  <div className="progress-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${evaluation.completionPct}%` }}
                    >
                      <span className="progress-text">
                        {evaluation.completionPct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="feedback-section">
                  <h3>Feedback:</h3>
                  <p className="feedback-text">{evaluation.feedback}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import { useState } from "react";
import "./App.css";

// Deployed PassportReady backend
const API_URL = "https://passportready-api.onrender.com";

function App() {
  const [step, setStep] = useState(1);

  // ============================================================
  // USER JOURNEY
  // ============================================================

  const [firstPassport, setFirstPassport] = useState(null);
  const [differentAddress, setDifferentAddress] = useState(null);
  const [hasAddressProof, setHasAddressProof] = useState(null);

  // ============================================================
  // DOCUMENTS
  // ============================================================

  const [documents, setDocuments] = useState({
    identity: null,
    address: null,
    photo: null,
  });

  // ============================================================
  // AI
  // ============================================================

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const goHome = () => {
    setStep(1);
    setAiAnswer("");
    setAiError("");
  };

  // ============================================================
  // PROGRESS
  // ============================================================

  const progress = {
    1: 0,
    2: 15,
    3: 30,
    4: 45,
    5: 60,
    6: 75,
    7: 85,
    8: 95,
    9: 100,
  };

  // ============================================================
  // DOCUMENT UPDATE
  // ============================================================

  const updateDocument = (name, value) => {
    setDocuments((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const documentsCompleted =
    documents.identity !== null &&
    documents.address !== null &&
    documents.photo !== null;

  // ============================================================
  // DOCUMENT SCORE
  // ============================================================

  const getDocumentScore = () => {
    let score = 0;

    if (documents.identity === "yes") score++;
    if (documents.address === "yes") score++;
    if (documents.photo === "yes") score++;

    return score;
  };

  // ============================================================
  // READINESS SCORE
  // ============================================================

  const calculateReadiness = () => {
    let score = 0;

    if (documents.identity === "yes") score += 25;
    if (documents.address === "yes") score += 25;
    if (documents.photo === "yes") score += 20;
    if (hasAddressProof === true) score += 20;
    if (firstPassport !== null) score += 10;

    return score;
  };

  // ============================================================
  // RECOMMENDATIONS
  // ============================================================

  const getRecommendations = () => {
    const recommendations = [];

    if (documents.identity !== "yes") {
      recommendations.push(
        "Review the identity document requirements applicable to your situation."
      );
    }

    if (documents.address !== "yes") {
      recommendations.push(
        "Review which address documents may be applicable to you."
      );
    }

    if (documents.photo !== "yes") {
      recommendations.push(
        "Check the latest applicable photograph requirements."
      );
    }

    if (hasAddressProof !== true) {
      recommendations.push(
        "Confirm which address proof is applicable before applying."
      );
    }

    if (differentAddress === true) {
      recommendations.push(
        "Carefully review the address information because your current and permanent addresses differ."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Review the latest official Passport Seva requirements before submitting your application."
      );
    }

    return recommendations;
  };

  // ============================================================
  // COMMON AI FUNCTION
  // ============================================================

  const askAI = async (question, intent = null) => {
    const finalQuestion = (question || aiQuestion).trim();

    if (!finalQuestion) {
      setAiAnswer("Please type a question first.");
      setAiError("");
      return;
    }

    setAiQuestion(finalQuestion);
    setAiAnswer("");
    setAiError("");
    setAiLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: finalQuestion,
          intent: intent,
        }),
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.answer || "AI request failed");
      }

      setAiAnswer(
        data.answer ||
          "I don't have a specific answer for that yet. Please try one of the suggested questions or verify the information on the official Passport Seva website."
      );
    } catch (error) {
      console.error("PassportReady AI error:", error);

      setAiError(
        "Unable to connect to PassportReady AI right now. Please try again."
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetApp = () => {
    const confirmed = window.confirm(
      "Are you sure you want to start again? Your current progress will be cleared."
    );

    if (!confirmed) return;

    setStep(1);

    setFirstPassport(null);
    setDifferentAddress(null);
    setHasAddressProof(null);

    setDocuments({
      identity: null,
      address: null,
      photo: null,
    });

    setAiQuestion("");
    setAiAnswer("");
    setAiError("");
    setAiLoading(false);
  };

  // ============================================================
  // AI ANSWER COMPONENT
  // ============================================================

  const AIAnswer = () => {
    if (aiLoading) {
      return (
        <div className="ai-response loading-response">
          <div className="ai-response-title">
            <span>🤖</span>
            <strong>PassportReady AI</strong>
          </div>

          <div className="typing-loader">
            <span></span>
            <span></span>
            <span></span>
            <p>Finding the best answer...</p>
          </div>
        </div>
      );
    }

    if (aiError) {
      return (
        <div className="ai-response error-response">
          <div className="ai-response-title">
            <span>⚠️</span>
            <strong>AI Connection Error</strong>
          </div>

          <p>{aiError}</p>
        </div>
      );
    }

    if (!aiAnswer) return null;

    return (
      <div className="ai-response">
        <div className="ai-response-title">
          <span>🤖</span>
          <strong>PassportReady AI</strong>
        </div>

        <p>{aiAnswer}</p>
      </div>
    );
  };

  // ============================================================
  // QUICK QUESTIONS
  // ============================================================

  const quickQuestions = [
    {
      text: "What documents should I prepare?",
      intent: "documents",
    },
    {
      text: "What can I use as address proof?",
      intent: "address_proof",
    },
    {
      text: "What should I know about my first passport?",
      intent: "first_passport",
    },
    {
      text: "What happens during a passport appointment?",
      intent: "appointment",
    },
  ];

  // ============================================================
  // APP
  // ============================================================

  return (
    <div className="app">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar">
        <button
          className="logo"
          onClick={goHome}
          type="button"
        >
          🇮🇳 <span>PassportReady</span>
        </button>

        <span className="nav-text">
          Independent Prototype
        </span>
      </nav>

      {/* ======================================================
          PROGRESS
      ====================================================== */}

      {step > 1 && (
        <div className="progress-container">
          <div className="progress-info">
            <span>Your progress</span>
            <strong>{progress[step]}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress[step]}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* ======================================================
          BACK
      ====================================================== */}

      {step > 1 && (
        <button
          className="back-button"
          onClick={goBack}
          type="button"
        >
          ← Back
        </button>
      )}

      {/* ======================================================
          STEP 1 — HOME
      ====================================================== */}

      {step === 1 && (
        <main className="hero">
          <div className="hero-content">

            <p className="badge">
              🛂 Passport preparation made simple
            </p>

            <h1>
              Get ready for your passport application
              <span> without the confusion.</span>
            </h1>

            <p className="subtitle">
              PassportReady helps you understand what to
              prepare, check document readiness and get
              AI-powered guidance before you apply.
            </p>

            <div className="home-buttons">

              <button
                className="start-button"
                onClick={() => setStep(2)}
                type="button"
              >
                Start My Passport Journey →
              </button>

              <button
                className="ai-main-button"
                onClick={() => setStep(9)}
                type="button"
              >
                🤖 Ask PassportReady AI
              </button>

            </div>

            <div className="feature-highlights">

              <div>
                <strong>✓</strong>
                <span>Personalized checklist</span>
              </div>

              <div>
                <strong>✓</strong>
                <span>Readiness score</span>
              </div>

              <div>
                <strong>✓</strong>
                <span>AI guidance</span>
              </div>

            </div>

            <p className="note">
              PassportReady is an independent prototype.
              It does not submit applications or collect
              real passport information.
            </p>

          </div>
        </main>
      )}

      {/* ======================================================
          STEP 2 — FIRST PASSPORT
      ====================================================== */}

      {step === 2 && (
        <section className="question-section">

          <p className="small-title">
            STEP 1 OF 3
          </p>

          <h2>
            Let's understand your situation
          </h2>

          <p>
            Are you applying for your first passport?
          </p>

          <div className="options">

            <button
              type="button"
              onClick={() => {
                setFirstPassport(true);
                setStep(3);
              }}
            >
              <strong>Yes</strong>
              <span>
                I have never had a passport before.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFirstPassport(false);
                setStep(3);
              }}
            >
              <strong>No</strong>
              <span>
                I already have or previously had a passport.
              </span>
            </button>

          </div>

          <button
            type="button"
            className="document-ai-button standalone-ai"
            onClick={() =>
              askAI(
                "What should I know about applying for my first passport?",
                "first_passport"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI about first passport
          </button>

          <AIAnswer />

        </section>
      )}

      {/* ======================================================
          STEP 3 — ADDRESS
      ====================================================== */}

      {step === 3 && (
        <section className="question-section">

          <p className="small-title">
            STEP 2 OF 3
          </p>

          <h2>
            Where are you applying from?
          </h2>

          <p>
            This helps PassportReady understand your
            address-related preparation.
          </p>

          <div className="options">

            <button
              type="button"
              onClick={() => {
                setDifferentAddress(false);
                setStep(4);
              }}
            >
              <strong>My current address</strong>

              <span>
                I am applying from the address where
                I currently live.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDifferentAddress(true);
                setStep(4);
              }}
            >
              <strong>A different address</strong>

              <span>
                My current address is different from
                my permanent address.
              </span>
            </button>

          </div>

          <button
            type="button"
            className="document-ai-button standalone-ai"
            onClick={() =>
              askAI(
                "What should I know about my current and permanent address when applying for an Indian passport?",
                "address"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI about address
          </button>

          <AIAnswer />

        </section>
      )}

      {/* ======================================================
          STEP 4 — ADDRESS PROOF
      ====================================================== */}

      {step === 4 && (
        <section className="question-section">

          <p className="small-title">
            STEP 3 OF 3
          </p>

          <h2>
            Do you have address proof?
          </h2>

          <p>
            This helps us prepare your document checklist.
          </p>

          <div className="options">

            <button
              type="button"
              onClick={() => {
                setHasAddressProof(true);
                setStep(5);
              }}
            >
              <strong>
                Yes, I have address proof
              </strong>

              <span>
                I have a document that can be used
                as address proof.
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setHasAddressProof(false);
                setStep(5);
              }}
            >
              <strong>
                I'm not sure
              </strong>

              <span>
                I need help understanding what may
                be accepted.
              </span>
            </button>

          </div>

          <button
            type="button"
            className="document-ai-button standalone-ai"
            onClick={() =>
              askAI(
                "What documents can be used as address proof for an Indian passport application?",
                "address_proof"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI about address proof
          </button>

          <AIAnswer />

        </section>
      )}

      {/* ======================================================
          STEP 5 — PERSONALIZED PREPARATION PLAN
      ====================================================== */}

      {step === 5 && (
        <section className="checklist-section">

          <p className="small-title">
            YOUR PERSONALIZED PLAN
          </p>

          <h2>
            Your Passport Preparation Checklist
          </h2>

          <p>
            PassportReady has used your answers to identify
            the areas you should review before moving to
            document readiness.
          </p>

          <div className="checklist">

            <div className="check-item">
              <span>🆕</span>

              <div>
                <strong>Application type</strong>

                <p>
                  {firstPassport
                    ? "You selected first passport."
                    : "You selected a previous passport / reissue."}
                </p>

                <button
                  type="button"
                  className="mini-ai-button"
                  onClick={() =>
                    askAI(
                      firstPassport
                        ? "What should I know about applying for my first passport?"
                        : "What should I know about passport reissue?",
                      firstPassport
                        ? "first_passport"
                        : "reissue"
                    )
                  }
                  disabled={aiLoading}
                >
                  🤖 Ask AI about this
                </button>
              </div>
            </div>

            <div className="check-item">
              <span>📍</span>

              <div>
                <strong>Current address</strong>

                <p>
                  {differentAddress
                    ? "Your current and permanent addresses are different."
                    : "You indicated that you are applying from your current address."}
                </p>

                <button
                  type="button"
                  className="mini-ai-button"
                  onClick={() =>
                    askAI(
                      "What should I know about address information for a passport application?",
                      "address"
                    )
                  }
                  disabled={aiLoading}
                >
                  🤖 Ask AI about this
                </button>
              </div>
            </div>

            <div className="check-item">
              <span>
                {hasAddressProof ? "✅" : "⚠️"}
              </span>

              <div>
                <strong>Address proof</strong>

                <p>
                  {hasAddressProof
                    ? "You indicated that you have address proof."
                    : "You indicated that you are unsure about address proof."}
                </p>

                <button
                  type="button"
                  className="mini-ai-button"
                  onClick={() =>
                    askAI(
                      "What documents can be used as address proof for an Indian passport application?",
                      "address_proof"
                    )
                  }
                  disabled={aiLoading}
                >
                  🤖 Ask AI about this
                </button>
              </div>
            </div>

          </div>

          <button
            type="button"
            className="document-ai-button plan-ai-button"
            onClick={() =>
              askAI(
                "What should I prepare before applying for an Indian passport based on my personalized preparation plan?",
                "documents"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI about My Preparation Plan
          </button>

          <AIAnswer />

          <button
            className="start-button"
            onClick={() => setStep(6)}
            type="button"
          >
            Continue to Document Readiness →
          </button>

        </section>
      )}

      {/* ======================================================
          STEP 6 — DOCUMENT READINESS
      ====================================================== */}

      {step === 6 && (
        <section className="checklist-section">

          <p className="small-title">
            STEP 4 — DOCUMENT READINESS
          </p>

          <h2>
            Are your documents ready?
          </h2>

          <p>
            Tell PassportReady what you currently have.
          </p>

          <div className="document-status-banner">

            <div className="status-icon">
              {getDocumentScore() === 3
                ? "🎉"
                : getDocumentScore() === 2
                ? "🚀"
                : "📋"}
            </div>

            <div>
              <strong>
                {getDocumentScore() === 3
                  ? "Excellent preparation"
                  : getDocumentScore() === 2
                  ? "Almost there"
                  : "Let's get prepared"}
              </strong>

              <p>
                {getDocumentScore()}/3 document checks completed.
              </p>
            </div>

            <div className="document-counter">
              {getDocumentScore()}/3
            </div>

          </div>

          {/* IDENTITY */}

          <div className="document-card">

            <div className="document-heading">
              <div className="document-icon">🪪</div>

              <div>
                <h3>Identity Document</h3>

                <p>
                  Do you have the identity document
                  you plan to use?
                </p>
              </div>
            </div>

            <div className="document-buttons">

              <button
                type="button"
                className={
                  documents.identity === "yes"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("identity", "yes")
                }
              >
                ✅ I have it
              </button>

              <button
                type="button"
                className={
                  documents.identity === "no"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("identity", "no")
                }
              >
                ⚠️ I need it
              </button>

              <button
                type="button"
                className={
                  documents.identity === "unsure"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("identity", "unsure")
                }
              >
                ❓ I'm not sure
              </button>

            </div>

            <button
              type="button"
              className="document-ai-button"
              onClick={() =>
                askAI(
                  "What identity documents should I review for my passport application?",
                  "identity"
                )
              }
              disabled={aiLoading}
            >
              🤖 Ask AI about identity documents
            </button>

            <AIAnswer />

          </div>

          {/* ADDRESS */}

          <div className="document-card">

            <div className="document-heading">
              <div className="document-icon">🏠</div>

              <div>
                <h3>Address Document</h3>

                <p>
                  Do you have an appropriate document
                  for your address?
                </p>
              </div>
            </div>

            <div className="document-buttons">

              <button
                type="button"
                className={
                  documents.address === "yes"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("address", "yes")
                }
              >
                ✅ I have it
              </button>

              <button
                type="button"
                className={
                  documents.address === "no"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("address", "no")
                }
              >
                ⚠️ I need it
              </button>

              <button
                type="button"
                className={
                  documents.address === "unsure"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("address", "unsure")
                }
              >
                ❓ I'm not sure
              </button>

            </div>

            <button
              type="button"
              className="document-ai-button"
              onClick={() =>
                askAI(
                  "What address documents should I review for a passport application?",
                  "address_proof"
                )
              }
              disabled={aiLoading}
            >
              🤖 Ask AI about address documents
            </button>

            <AIAnswer />

          </div>

          {/* PHOTO */}

          <div className="document-card">

            <div className="document-heading">
              <div className="document-icon">📷</div>

              <div>
                <h3>Photograph</h3>

                <p>
                  Have you checked the applicable
                  photograph requirements?
                </p>
              </div>
            </div>

            <div className="document-buttons">

              <button
                type="button"
                className={
                  documents.photo === "yes"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("photo", "yes")
                }
              >
                ✅ Ready
              </button>

              <button
                type="button"
                className={
                  documents.photo === "no"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("photo", "no")
                }
              >
                ⚠️ Not ready
              </button>

              <button
                type="button"
                className={
                  documents.photo === "unsure"
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  updateDocument("photo", "unsure")
                }
              >
                ❓ I'm not sure
              </button>

            </div>

            <button
              type="button"
              className="document-ai-button"
              onClick={() =>
                askAI(
                  "What should I know about passport photograph requirements?",
                  "photo"
                )
              }
              disabled={aiLoading}
            >
              🤖 Ask AI about photographs
            </button>

            <AIAnswer />

          </div>

          <div className="privacy-box">
            <strong>🔐 Privacy reminder</strong>

            <p>
              Do not enter passport numbers, Aadhaar numbers,
              OTPs, passwords or other sensitive personal
              information into this prototype.
            </p>
          </div>

          <button
            className="start-button"
            disabled={!documentsCompleted}
            onClick={() => setStep(7)}
            type="button"
          >
            {documentsCompleted
              ? "Calculate My Readiness →"
              : "Answer All 3 Document Checks"}
          </button>

        </section>
      )}

      {/* ======================================================
          STEP 7 — READINESS
      ====================================================== */}

      {step === 7 && (
        <section className="checklist-section">

          <p className="small-title">
            SMART READINESS CHECK
          </p>

          <h2>Your Passport Readiness</h2>

          <p>
            PassportReady analyzed your answers and
            document preparation.
          </p>

          <div className="readiness-card">

            <div className="score-circle">
              <div className="score-number">
                {calculateReadiness()}%
              </div>

              <div className="score-label">
                Ready
              </div>
            </div>

            <div className="readiness-content">

              <h3>
                {calculateReadiness() === 100
                  ? "🎉 You're Ready!"
                  : calculateReadiness() >= 75
                  ? "🚀 Almost Ready!"
                  : calculateReadiness() >= 50
                  ? "👍 Good Progress!"
                  : "⚠️ More Preparation Needed"}
              </h3>

              <p>
                Review the remaining items before continuing.
              </p>

            </div>

          </div>

          {/* WHY THIS SCORE */}

          <div className="score-breakdown">

            <div className="breakdown-header">
              <div>
                <span className="small-title">
                  WHY THIS SCORE?
                </span>

                <h3>
                  Your preparation breakdown
                </h3>
              </div>

              <span className="total-score">
                {calculateReadiness()}/100
              </span>
            </div>

            <div className="score-row">
              <div className="score-row-left">
                <span className="score-icon">🪪</span>

                <div>
                  <strong>Identity document</strong>
                  <small>Maximum contribution</small>
                </div>
              </div>

              <strong className="score-value">
                {documents.identity === "yes" ? "+25" : "0"}
              </strong>
            </div>

            <div className="score-row">
              <div className="score-row-left">
                <span className="score-icon">🏠</span>

                <div>
                  <strong>Address document</strong>
                  <small>Maximum contribution</small>
                </div>
              </div>

              <strong className="score-value">
                {documents.address === "yes" ? "+25" : "0"}
              </strong>
            </div>

            <div className="score-row">
              <div className="score-row-left">
                <span className="score-icon">📷</span>

                <div>
                  <strong>Photograph</strong>
                  <small>Requirements checked</small>
                </div>
              </div>

              <strong className="score-value">
                {documents.photo === "yes" ? "+20" : "0"}
              </strong>
            </div>

            <div className="score-row">
              <div className="score-row-left">
                <span className="score-icon">📍</span>

                <div>
                  <strong>Address proof</strong>
                  <small>Address proof available</small>
                </div>
              </div>

              <strong className="score-value">
                {hasAddressProof ? "+20" : "0"}
              </strong>
            </div>

            <div className="score-row">
              <div className="score-row-left">
                <span className="score-icon">🛂</span>

                <div>
                  <strong>Application type</strong>
                  <small>Application type selected</small>
                </div>
              </div>

              <strong className="score-value">
                {firstPassport !== null ? "+10" : "0"}
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="document-ai-button"
            onClick={() =>
              askAI(
                "What should I do next to improve my passport preparation?",
                "documents"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI what I should do next
          </button>

          <AIAnswer />

          <div className="recommendations">

            <span className="small-title">
              SMART GUIDANCE
            </span>

            <h3>
              💡 Recommended next steps
            </h3>

            {getRecommendations().map(
              (recommendation, index) => (
                <div
                  className="recommendation"
                  key={index}
                >
                  <span>{index + 1}</span>
                  <p>{recommendation}</p>
                </div>
              )
            )}

          </div>

          <div className="step-actions">

            <button
              className="secondary-button"
              type="button"
              onClick={() => setStep(6)}
            >
              ← Review Documents
            </button>

            <button
              className="start-button"
              type="button"
              onClick={() => setStep(8)}
            >
              Continue My Passport Journey →
            </button>

          </div>

        </section>
      )}

      {/* ======================================================
          STEP 8 — JOURNEY
      ====================================================== */}

      {step === 8 && (
        <section className="checklist-section">

          <p className="small-title">
            YOUR JOURNEY
          </p>

          <h2>What happens next?</h2>

          <p>
            A simplified view of the passport preparation journey.
          </p>

          <div className="journey">

            <div className="journey-step">
              <span>1</span>
              <strong>Prepare</strong>
              <p>
                Get your documents and information ready.
              </p>
            </div>

            <div className="journey-step">
              <span>2</span>
              <strong>Apply</strong>
              <p>
                Complete the application through the official process.
              </p>
            </div>

            <div className="journey-step">
              <span>3</span>
              <strong>Appointment</strong>
              <p>
                Attend the required appointment with your documents.
              </p>
            </div>

            <div className="journey-step">
              <span>4</span>
              <strong>Verification</strong>
              <p>
                Complete the applicable verification process.
              </p>
            </div>

            <div className="journey-step">
              <span>5</span>
              <strong>Processing</strong>
              <p>
                Track your application through the official system.
              </p>
            </div>

          </div>

          <a
            href="https://www.passportindia.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="official-link"
          >
            🌐 Visit Official Passport Seva Website →
          </a>

          <button
            className="document-ai-button"
            type="button"
            onClick={() =>
              askAI(
                "What should I know about the passport journey from preparation to processing?",
                "application"
              )
            }
            disabled={aiLoading}
          >
            🤖 Ask AI about the passport journey
          </button>

          <AIAnswer />

          <button
            className="start-button"
            onClick={() => setStep(9)}
            type="button"
          >
            🤖 Ask PassportReady AI
          </button>

        </section>
      )}

      {/* ======================================================
          STEP 9 — AI ASSISTANT
      ====================================================== */}

      {step === 9 && (
        <section className="ai-section">

          <p className="small-title">
            AI ASSISTANT
          </p>

          <h2>
            Ask PassportReady AI
          </h2>

          <p>
            Ask a passport preparation question in simple language.
          </p>

          <div className="quick-questions">

            <h3>Quick questions</h3>

            <div className="quick-question-list">

              {quickQuestions.map(
                (item, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() =>
                      askAI(item.text, item.intent)
                    }
                    disabled={aiLoading}
                  >
                    {item.text}
                  </button>
                )
              )}

            </div>

          </div>

          <div className="ai-box">

            <textarea
              value={aiQuestion}
              onChange={(e) =>
                setAiQuestion(e.target.value)
              }
              placeholder="Example: What documents should I prepare?"
              disabled={aiLoading}
            />

            <button
              type="button"
              onClick={() => askAI()}
              disabled={aiLoading}
            >
              {aiLoading
                ? "🤖 Thinking..."
                : "🤖 Ask AI"}
            </button>

          </div>

          <AIAnswer />

          <a
            href="https://www.passportindia.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="official-link"
          >
            🌐 Verify information on Official Passport Seva
          </a>

          <button
            className="start-button"
            onClick={resetApp}
            type="button"
          >
            ← Start Again
          </button>

        </section>
      )}

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>
        <p>
          PassportReady is an independent prototype and
          is not an official government website.
        </p>
      </footer>

    </div>
  );
}

export default App;
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="PassportReady AI API",
    description="PassportReady predefined-answer AI assistant",
    version="4.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class QuestionRequest(BaseModel):
    question: str
    intent: Optional[str] = None


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "PassportReady AI backend is running!",
        "version": "4.0.0",
        "ai_type": "predefined_answers",
        "gemini_required": False,
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "PassportReady AI",
        "ai_type": "predefined_answers",
    }


# ============================================================
# INTENT DETECTION
# ============================================================

def detect_intent(question: str) -> str:

    q = question.lower().strip()

    # Most specific topics first
    if any(x in q for x in [
        "address proof",
        "proof of address",
        "address document",
        "address documents",
        "what can i use as address",
    ]):
        return "address_proof"

    if any(x in q for x in [
        "first passport",
        "first time passport",
        "new passport",
        "never had a passport",
        "apply for first passport",
    ]):
        return "first_passport"

    if any(x in q for x in [
        "reissue",
        "renew passport",
        "renewal",
        "expired passport",
        "passport expired",
    ]):
        return "reissue"

    if any(x in q for x in [
        "identity document",
        "identity proof",
        "id proof",
        "identity",
    ]):
        return "identity"

    if any(x in q for x in [
        "photograph",
        "passport photo",
        "passport photograph",
        "photo requirement",
        "photo requirements",
    ]):
        return "photo"

    if any(x in q for x in [
        "documents",
        "document",
        "papers",
        "paperwork",
        "what should i prepare",
        "what do i need",
    ]):
        return "documents"

    if any(x in q for x in [
        "address",
        "current address",
        "permanent address",
        "different address",
        "address information",
    ]):
        return "address"

    if any(x in q for x in [
        "appointment",
        "book appointment",
        "schedule appointment",
        "appointment date",
    ]):
        return "appointment"

    if any(x in q for x in [
        "psk",
        "passport seva kendra",
        "passport office",
    ]):
        return "psk"

    if any(x in q for x in [
        "police verification",
        "police",
        "verification",
    ]):
        return "police_verification"

    if any(x in q for x in [
        "fee",
        "fees",
        "cost",
        "price",
        "how much",
    ]):
        return "fees"

    if any(x in q for x in [
        "tatkal",
        "urgent passport",
        "fast passport",
    ]):
        return "tatkal"

    if any(x in q for x in [
        "processing time",
        "how long",
        "how many days",
        "when will",
    ]):
        return "processing_time"

    if any(x in q for x in [
        "track",
        "tracking",
        "application status",
        "status",
    ]):
        return "tracking"

    if any(x in q for x in [
        "lost passport",
        "passport lost",
        "lost my passport",
    ]):
        return "lost_passport"

    if any(x in q for x in [
        "damaged passport",
        "passport damaged",
        "damage passport",
    ]):
        return "damaged_passport"

    if any(x in q for x in [
        "how to apply",
        "apply for passport",
        "passport application",
        "application process",
        "application procedure",
    ]):
        return "application"

    if any(x in q for x in [
        "child passport",
        "minor passport",
        "passport for child",
        "under 18",
    ]):
        return "minor"

    if any(x in q for x in [
        "name change",
        "change name",
        "changed my name",
        "surname change",
    ]):
        return "name_change"

    if any(x in q for x in [
        "date of birth",
        "dob",
        "birth date",
    ]):
        return "date_of_birth"

    if any(x in q for x in [
        "marriage",
        "married",
        "spouse",
        "marriage certificate",
    ]):
        return "marriage"

    if "passport" in q:
        return "general_passport"

    return "unknown"


# ============================================================
# PREDEFINED AI ANSWERS
# ============================================================

ANSWERS = {

    "first_passport": """
If this is your first passport, you should first identify the applicable fresh-passport application process.

Generally, prepare the documents relevant to your identity, address and other applicable requirements.

Before submitting your application, always verify the latest requirements on the official Passport Seva website.

PassportReady is only a preparation assistant and does not submit passport applications.
""",

    "address": """
For your passport application, make sure the address information you provide is accurate and consistent with your applicable supporting documents.

If your current and permanent addresses are different, carefully review which address you need to provide and what supporting document may be applicable.

Always verify the latest official Passport Seva requirements before applying.
""",

    "address_proof": """
Address proof is used to support the address provided in your passport application.

The applicable documents can depend on your individual circumstances and the current official requirements.

Please check the latest accepted address-proof documents on the official Passport Seva website before applying.

Do not enter Aadhaar numbers, passport numbers, OTPs or other sensitive information into PassportReady.
""",

    "documents": """
The documents you need depend on your application type and circumstances.

PassportReady focuses on three important preparation areas:

1. Identity document
2. Address document
3. Photograph requirements

There may also be additional supporting documents depending on your situation.

Always verify the latest official Passport Seva document requirements.
""",

    "identity": """
You should prepare an applicable identity document for your passport application.

The exact document requirements depend on your circumstances and application type.

Review the current official Passport Seva document list before applying.
""",

    "photo": """
Check the latest official Passport Seva photograph requirements before your appointment.

Requirements can depend on the current application and appointment process.

Avoid relying on outdated photograph specifications.
""",

    "application": """
The general passport journey is:

1. Identify the appropriate application type.
2. Prepare the applicable documents.
3. Complete the official application process.
4. Schedule an appointment if required.
5. Attend the designated centre.
6. Complete any applicable verification.
7. Track the application through the official system.

PassportReady helps you prepare but does not submit applications.
""",

    "reissue": """
If you already have or previously had a passport, you may need the applicable reissue process.

The required documents can depend on why the passport is being reissued, such as expiry or changes in personal details.

Verify the current official Passport Seva requirements for your specific situation.
""",

    "appointment": """
For a passport appointment, follow the instructions provided by the official Passport Seva system.

Keep the applicable documents and information ready.

The exact documents can vary depending on your application type and circumstances.
""",

    "psk": """
PSK means Passport Seva Kendra.

It is a designated centre where applicable passport services and appointment processes are handled.

Follow the appointment instructions provided through the official Passport Seva system.
""",

    "police_verification": """
Police verification may apply depending on your application and circumstances.

The timing and procedure can vary.

Follow the instructions provided through the official Passport Seva process.
""",

    "fees": """
Passport fees depend on factors such as the application type and applicable service category.

Fees can change, so always check the latest official Passport Seva fee information before making a payment.
""",

    "tatkal": """
Tatkal is an expedited passport service category.

Eligibility, fees, documents and processing conditions can differ from the normal process.

Verify the current Tatkal requirements through the official Passport Seva system.
""",

    "processing_time": """
Passport processing time can vary depending on application type, verification requirements and other circumstances.

For the most current processing information, use the official Passport Seva system.
""",

    "tracking": """
You can track your passport application through the official Passport Seva system using the information requested there.

PassportReady does not access or store your real application information.
""",

    "lost_passport": """
If your passport has been lost, follow the official Passport Seva guidance for reporting the loss and applying through the applicable reissue procedure.

Do not enter your passport number or other sensitive information into PassportReady.
""",

    "damaged_passport": """
If your passport is damaged, check the official Passport Seva guidance for the applicable reissue process.

The requirements can depend on the circumstances of the damage.

Do not enter sensitive passport information into PassportReady.
""",

    "minor": """
Passport applications for minors can have additional requirements involving the child and parents or guardians.

Verify the current minor passport requirements on the official Passport Seva website.
""",

    "name_change": """
If your name has changed, the applicable passport process can depend on the reason for the change and the supporting documentation available.

Review the latest official Passport Seva requirements for name changes.
""",

    "date_of_birth": """
Date-of-birth requirements depend on the documents available and your individual circumstances.

Verify the current official Passport Seva document requirements before applying.
""",

    "marriage": """
Marriage or changes in marital details can affect the information or supporting documents required in some passport applications.

Check the latest official Passport Seva guidance for your situation.
""",

    "general_passport": """
I can help you with passport preparation, documents, address proof, identity documents, photographs, applications, appointments, PSK, police verification, fees, Tatkal, reissue, lost or damaged passports and tracking.
""",
}


# ============================================================
# FALLBACK
# ============================================================

FALLBACK_ANSWER = """
I don't have a specific answer for that yet.

Please try one of the suggested questions or verify the information on the official Passport Seva website.
"""


# ============================================================
# AI ENDPOINT
# ============================================================

@app.post("/ask-ai")
def ask_ai(request: QuestionRequest):

    question = request.question.strip()

    if not question:
        return {
            "success": False,
            "answer": "Please type a passport-related question first.",
            "intent": "empty",
        }

    # Use frontend intent when supplied.
    # Otherwise detect automatically.
    intent = request.intent

    if not intent:
        intent = detect_intent(question)

    answer = ANSWERS.get(intent, FALLBACK_ANSWER)

    return {
        "success": True,
        "answer": answer.strip(),
        "intent": intent,
        "question": question,
        "source": "PassportReady predefined AI",
    }


# ============================================================
# QUICK QUESTIONS
# ============================================================

@app.get("/quick-questions")
def quick_questions():

    return {
        "questions": [
            "What documents should I prepare?",
            "What can I use as address proof?",
            "What should I know about my first passport?",
            "What should I know about my current address?",
            "What identity documents should I prepare?",
            "What should I know about passport photographs?",
            "How do I apply for a passport?",
            "What happens during a passport appointment?",
            "What happens during police verification?",
            "How much does a passport cost?",
            "What is Tatkal passport?",
            "How can I track my application?",
        ]
    }


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
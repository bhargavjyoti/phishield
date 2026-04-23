# 🛡️ PhiShield AI

### Human-Centric Defense Matrix for Real-Time Phishing Vulnerability Analysis

**PhiShield AI** is an advanced, human-centric phishing detection system that analyzes both the threat level of an email and the specific vulnerability of the user. By combining heuristic message scanning with behavioral profiling, PhiShield delivers highly personalized risk assessments and actionable countermeasures.

[**Live Demo (phishield.vercel.app)**](https://phishield.vercel.app){:target="_blank"}

---

## ✨ Key Features

- 🧠 **AI-Powered Threat Analysis**: Utilizes the powerful **Llama 3.3 70B** model via the Groq API for rapid, accurate, and deep heuristic scanning of email content.
- 👤 **Human-Centric Profiling**: Users configure a behavioral profile via an interactive MCQ quiz. The AI uses this data to calculate a personalized vulnerability score.
- 🎯 **Targeted Recommendations**: Provides "Immediate Actions" and "Things to Stop" tailored specifically to the user's habits and the exact nature of the threat (e.g., Credential Harvesting, Advance-Fee Scam).
- 📊 **Dynamic Dashboard & UI**: Features a sleek, hacker-style interface built with Tailwind CSS and Framer Motion, complete with animated vulnerability rings and real-time scanning feedback.
- 🚦 **Robust Error Handling**: Gracefully handles API rate limits, network disconnects, timeouts, and missing data with informative UI modals—ensuring the application never crashes.
- 🗄️ **Local History Tracking**: Automatically saves past scan results and user profiles to local storage for persistent sessions across reloads.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend / API Route**: Next.js Serverless Functions (`app/api`)
- **LLM Provider**: [Groq API](https://groq.com/) (Model: `llama-3.3-70b-versatile`)

---

## 🚀 Getting Started

### Prerequisites

You will need a Groq API Key to run the AI analysis locally. You can get one for free at the [Groq Console](https://console.groq.com/).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/phishield.git
   cd phishield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root of the project and add your Groq API key:
   ```env
   GROQ_API_KEY=your_actual_api_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 How It Works

1. **Configure Profile**: Users take a quick quiz to establish their technical literacy, stress levels at work, and security habits.
2. **Input Stream**: Users paste suspicious email or message content into the terminal interface.
3. **AI Execution**: The Next.js API securely sends the message content and the user's profile context to the Groq API.
4. **Scoring & Parsing**: The backend parses the LLM's JSON response, mapping out risk scores, confidence levels, and extracting the specific attack type.
5. **Dashboard Visualization**: The frontend beautifully visualizes the results, providing clear advice on how to proceed.

---

## 🛡️ License

This project is licensed under the MIT License.

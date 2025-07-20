
# Forensic Reliability Suite

## Overview

The **Forensic Reliability Suite** is an advanced, educational web application designed to demonstrate the critical importance of forensic tool reliability and evidence integrity. It provides legal professionals, students, and digital forensics investigators with a hands-on platform to understand how compromised or flawed forensic tools can produce misleading or entirely fabricated evidence.

Through a series of interactive modules, users can compare the outputs of an "authentic" (correctly functioning) tool against a "compromised" (maliciously or negligently flawed) tool, highlighting the subtle and overt ways digital evidence can be misrepresented. The suite integrates with the Google Gemini API to provide expert analysis, strategic legal feedback, and up-to-date threat intelligence.

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [API Key Management](#api-key-management)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Application Architecture](#application-architecture)
- [Technical Description of Features](#technical-description-of-features)
  - [Core Modules](#core-modules)
  - [Intelligence & Strategy](#intelligence--strategy)
  - [Core Services](#core-services)
- [User Guide (for Non-Technical Users)](#user-guide-for-non-technical-users)
  - [Exploring a Forensic Module](#exploring-a-forensic-module)
  - [Using the Strategy Simulator](#using-the-strategy-simulator)
- [Contributing](#contributing)
- [License](#license)

## Key Features

- **Interactive Forensic Modules:** Side-by-side comparisons for various forensic tasks, including Hash Verification, Metadata Extraction, File Carving, Disk Imaging, and more.
- **Simulation & Live Data Modes:** Run pre-configured simulations or use the "Live Data" mode to analyze your own files in select modules.
- **AI-Powered Analysis:** Integrated Gemini chat provides expert explanations and allows users to ask context-specific follow-up questions.
- **Legal Impact Section:** For each module, explore potential cross-examination questions, relevant case law, and applicable rules of evidence.
- **Daubert Motion Outline Generator:** Instantly generate a formatted `.docx` outline for a motion to exclude unreliable expert testimony.
-**Intelligence Dashboard:** A landing page with AI-generated widgets for emerging threats, forensic concepts, and a tool-vetting checklist.
- **Case Strategy Simulator:** Test your legal instincts in various scenarios and receive AI-driven feedback on your chosen strategy.
- **Progressive Enhancement:** Works in demo mode without an API key, with full AI features unlocked when a key is provided.
- **User-Friendly API Key Management:** Secure in-browser API key storage with easy setup.
- **Responsive Design:** Fully functional on desktop and tablet devices.

## Technology Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Document Generation:** `docx`
- **File Saving:** `file-saver`
- **Build/Dev Environment:** Vite (via CDN import map for this project)

## Getting Started

### Prerequisites

- A modern web browser that supports ES Modules (Chrome, Firefox, Edge, Safari).
- An internet connection for loading libraries and accessing the Gemini API.

### API Key Management

This application requires a Google Gemini API key to enable its AI-powered features (Intelligence Dashboard, Forensic Insights Chat, Strategy Simulator).

#### For End Users (Hosted Version)

The application features **progressive enhancement** - it works without an API key but provides enhanced functionality when one is provided:

1. **Demo Mode (No API Key):** The application displays static demo content and educational information
2. **Full AI Mode (With API Key):** Unlocks live AI analysis, threat intelligence, and interactive chat features

**To enable AI features:**
1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Add API Key" in the banner that appears at the top of the application
3. Enter your key - it's stored securely in your browser's local storage
4. Your key is never sent to our servers and remains private to your browser session

#### For Developers (Local Development)

You can provide an API key through environment variables for development:

1. **Create an Environment File:** In the root directory, create a file named `.env`
2. **Set the Variable:** Add the following line, replacing `YOUR_API_KEY_HERE` with your actual key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

**Security Notes:**
- User-provided API keys are stored only in browser localStorage
- Environment variables are only used during build time
- Keys are never transmitted to external servers (except directly to Google's Gemini API)
- The `.gitignore` file prevents accidental commit of `.env` files

### Installation

As this project is designed as a standalone `index.html` with modern JavaScript modules loaded via an import map, there is no traditional build step required. Simply clone or download the repository.

```bash
git clone <repository-url>
cd forensic-reliability-suite
```

### Running the Application

#### Local Development

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create environment file:**
    ```bash
    cp .env.example .env
    ```
    Then edit `.env` and add your Gemini API key.

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  Open your web browser and navigate to `http://localhost:5173`

#### Production Build

To build for production:
```bash
npm run build:prod
```

The built files will be in the `dist/` directory.

#### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy the site
3. The site will be available at: `https://castle-bravo-project.github.io/forensic-tool-reliability-suite/`

**Note:** Make sure to add your `GEMINI_API_KEY` as a repository secret in GitHub for the deployment to work with AI features.

## Application Architecture

The application follows a modern component-based architecture.

-   `index.html`: The main entry point. It loads Tailwind CSS, sets up the import map for dependencies, and contains the root `<div>` for the React app.
-   `index.tsx`: The React entry point that renders the main `App` component.
-   `App.tsx`: The top-level component that sets up the `HashRouter` and defines all application routes. It also contains the main layout, including the `Sidebar`.
-   `components.tsx`: A collection of reusable UI components used throughout the application, from simple buttons and cards to complex components like `ComparisonView`, `FileUpload`, and the AI `Chat` interface.
-   `types.ts`: Centralized TypeScript interfaces and type definitions for data structures used across the app (e.g., `CarvingResults`, `StrategyScenario`, `ChatMessage`).
-   `pages/`: Each file in this directory represents a major page/view within the application (e.g., `DashboardPage.tsx`, `HashVerification.tsx`).
-   `services/`: Contains modules that handle external logic and API interactions.
    -   `geminiService.ts`: Handles all communication with the Google Gemini API.
    -   `docService.ts`: Responsible for generating the `.docx` Daubert motion outline.

## Technical Description of Features

### Core Modules

All forensic modules (e.g., `HashVerification`, `FileCarving`) share a similar structure:
1.  **State Management:** Use `React.useState` to manage the simulation state, loading status, and results.
2.  **Simulation Logic:** The `runSimulation` function is typically wrapped in `useCallback`. It sets a loading state, then uses `setTimeout` to mimic an asynchronous analysis process. It populates state with hardcoded "authentic" and "compromised" result objects.
3.  **Terminal Content Generation:** During the simulation, detailed strings representing terminal/log output are generated and stored in state to be displayed in the `TerminalOutput` component. This provides a narrative for *how* the tool arrived at its conclusion.
4.  **AI Prompt Generation:** A detailed, context-specific prompt is constructed using the results of the simulation. This prompt is passed to the `<Chat>` component to initiate the AI analysis.
5.  **View Rendering:** The `ComparisonView` component is used to display the "Compromised" and "Authentic" results side-by-side.
6.  **Legal Analysis:** The `LegalImpactAnalysis` component displays static content (questions, case law summaries) and has an `onGenerateDoc` prop that calls the `docService` to create the Word document.

### Intelligence & Strategy

-   **DashboardPage.tsx:** This page contains several "widgets" that fetch data on load.
    -   `EmergingThreatsWidget`: Uses `getGroundedInsights` from the `geminiService` to perform a Google Search-grounded query for recent news and rulings. It then parses the response and displays the text and source links.
    -   `ConceptOfTheDayWidget`: Selects a concept from a predefined list based on the current date. It then uses `getSimpleInsight` from `geminiService` to fetch a concise explanation.
-   **StrategySimulatorPage.tsx:**
    -   Maintains an array of `StrategyScenario` objects, each containing a title, description, a report component, user options, and a function to generate a feedback prompt.
    -   When a user selects an option, it calls `getStrategyFeedback` from `geminiService` with a highly specific prompt to evaluate the chosen legal strategy, and displays the streaming response.

### Core Services

-   **geminiService.ts:**
    -   Initializes the `GoogleGenAI` client using the `API_KEY` from `process.env`.
    -   `isGeminiAvailable()`: A simple check used throughout the UI to enable/disable AI features.
    -   `getGroundedInsights(prompt)`: Calls `ai.models.generateContent` with a `tools: [{ googleSearch: {} }]` configuration to get answers grounded in real-time web search results. It extracts the text and the grounding metadata (source URLs).
    -   `getSimpleInsight(prompt)`: Performs a standard text generation request.
    -   `getStrategyFeedback(prompt)`: Uses a specific `systemInstruction` to prime the model to act as a law professor, providing tailored feedback.
    -   `startChatSession()`: Creates a new `Chat` instance with a system instruction to act as a digital forensics expert, used for the interactive chat component in the modules.
-   **docService.ts:**
    -   `generateDaubertOutline(...)`: Accepts a title, summary, rules, and questions as arguments.
    -   It uses the `docx` library to programmatically build a document with styled headings, paragraphs, bullet points, and text runs.
    -   `Packer.toBlob(doc)` converts the document object into a binary blob.
    -   `saveAs(blob, ...)` from the `file-saver` library triggers a browser download of the generated `.docx` file.

## User Guide (for Non-Technical Users)

Welcome to the Forensic Reliability Suite! This guide will help you navigate the application and understand its core functionality.

### Exploring a Forensic Module

Let's walk through the **Hash Verification** module as an example. All other modules work similarly.

1.  **Navigate:** Click "Hash Verification" in the sidebar on the left.
2.  **Read the Introduction:** The page begins with a brief explanation of what the module demonstrates.
3.  **Run the Simulation:** Click the blue **"Run Simulation"** button. The application will pretend to analyze a file.
4.  **Observe the Results:** Two panels will appear:
    -   **Compromised Tool Output (Left, Red):** This shows what a faulty or malicious tool would report. Notice the hash value is incorrect.
    -   **Authentic Tool Output (Right, Green):** This shows the correct result.
5.  **Check the Logs:** Below each result is a "Execution Log" in a black terminal window. This tells the story of *how* each tool got its result. You'll see the compromised tool's log might say things like `[WARN] File buffer analysis skipped` or `// Maliciously hardcoded hash`, revealing its deception.
6.  **Read the Analysis:**
    -   **Forensic Insights Chat:** An AI chat window will appear, providing an expert explanation of the discrepancy you just saw and its importance. You can type follow-up questions into this chat!
    -   **Educational Focus:** An open panel at the bottom explains the "why" behind hash verification in simple terms.
    -   **Legal Impact & Strategy:** This is the most critical section for legal professionals. You can review:
        -   **Cross-Examination Questions:** Ideas for what to ask an expert who used an unreliable tool.
        -   **Relevant Case Law:** Fictional or real-world examples of how these issues play out in court.
        -   **Rules of Evidence:** The specific legal rules that apply to this type of evidence failure.
7.  **Generate a Motion:** Click the **"Generate Daubert Motion Outline"** button. A professionally formatted Word document will be downloaded, providing you with a ready-made outline to challenge the compromised evidence in court.

### Using the Strategy Simulator

1.  **Navigate:** Click "Strategy Simulator" in the sidebar.
2.  **Choose a Scenario:** Click on any of the scenario cards (e.g., "The Broken Copy," "The Falsified Alibi").
3.  **Review the Case:** The selected scenario will appear. Read the description and review the piece of flawed evidence presented (e.g., the report with the failed hash verification).
4.  **Select Your Strategy:** Read the four possible strategic options. Click the one you think is the best course of action.
5.  **Get Instant Feedback:** The system will send your choice to an AI law professor for analysis. A "Strategy Feedback" panel will appear, explaining the pros and cons of your choice and why other options might be better or worse. This is a safe space to test your legal intuition!

## Contributing

Contributions are welcome! If you have ideas for new features, forensic modules, or improvements, please feel free to:

1.  [Open an issue](<!-- GITHUB_ISSUE_LINK -->) to discuss your ideas.
2.  Fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

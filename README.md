# CodePilot: Your AI-Powered Web IDE

Welcome to CodePilot, a feature-rich, cloud-native Integrated Development Environment (IDE) built with Next.js and powered by Google's Gemini models through Genkit. This application is designed to provide a seamless, interactive, and intelligent coding experience directly in your browser.

CodePilot is more than just a text editor; it's an AI-first development environment that understands your project, helps you write and refactor code, manages version control, and provides a real-time preview of your web applications.

---

## 1. Core Features

CodePilot is packed with features designed to create a productive and enjoyable development workflow.

### 1.1. AI Coder Assistant

The heart of CodePilot is its conversational AI assistant, powered by Genkit.

- **Conversational Code Edits**: Simply tell the AI what you want to do in plain English (e.g., "add a contact form" or "refactor this component to use a different state management library").
- **Full Project Context**: The AI can analyze all the files in your project to understand the context and make intelligent, project-wide changes.
- **Automated Commits**: When the AI applies changes, it automatically generates a descriptive commit message and saves a snapshot of the work to the version control system.
- **Persistent Conversation History**: Your conversation with the AI is saved and restored, allowing you to maintain a continuous workflow and context across sessions.

### 1.2. Integrated Version Control

CodePilot includes a simple but powerful local version control system.

- **Track Changes**: Files are automatically marked as modified when you type.
- **Commit History**: Create commits with descriptive messages to save snapshots of your project at different points in time.
- **Time-Travel Debugging**: View the state of your project from any previous commit in a read-only mode. This is invaluable for understanding how your code has evolved and for tracking down regressions.

### 1.3. Real-time Previews and Integrated Terminal

- **Live Web Preview**: See your HTML, CSS, and JavaScript changes rendered in a live preview panel instantly.
- **Integrated Terminal**: A fully functional terminal powered by xterm.js allows you to run shell commands on the backend.
- **Client-Side Code Execution**: Run JavaScript and Python code directly in the browser, with output piped to the terminal, using a Web Worker and Pyodide, respectively.

### 1.4. Secure Authentication and Cloud Persistence

- **User Accounts**: Secure user authentication is handled by Firebase Authentication, supporting both email/password and Google OAuth providers.
- **Cloud-Based Projects**: Your entire project, including all files, commit history, and even your AI conversation, is securely saved in Firestore. This means you can log in from any device and resume your work exactly where you left off.

### 1.5. Customizable and Modern UI

- **Professional Editor**: The core editor is powered by Monaco, the same engine that runs VS Code, providing a familiar and powerful coding experience.
- **Component-Based UI**: The interface is built with the modern and accessible **shadcn/ui** component library.
- **Customizable Themes**: Switch between multiple pre-built themes (including light, dark, and high-contrast options) to suit your preference.
- **Responsive Design**: The UI is designed to be fully responsive, providing a seamless experience on both desktop and mobile devices.

---

## 2. Tech Stack

CodePilot is built on a modern, robust, and scalable technology stack.

- **Framework**: **Next.js 15** (with App Router)
- **Language**: **TypeScript**
- **AI Integration**: **Genkit** with Google's **Gemini** models.
- **UI Components**: **shadcn/ui**
- **Styling**: **Tailwind CSS**
- **State Management**: **Zustand**
- **Authentication & Database**: **Firebase** (Auth and Firestore)
- **Editor Component**: **Monaco Editor** (via `@monaco-editor/react`)
- **Terminal Component**: **xterm.js**
- **Client-Side Python**: **Pyodide**

---

## 3. Project Structure

The project is organized into a logical and maintainable structure.

```
/
├── public/                 # Static assets (workers, images)
│   └── js-worker.js        # Web worker for isolated JS execution
├── src/
│   ├── app/                # Next.js App Router pages and layouts
│   │   ├── (auth)/         # Route group for auth pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── globals.css     # Global styles and theme variables
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main application entry point
│   ├── components/         # Reusable React components
│   │   ├── sidebar/        # Components for the main sidebar
│   │   ├── ui/             # Core shadcn/ui components
│   │   └── codepilot-page.tsx # The main IDE interface component
│   ├── ai/                 # Genkit AI flows and configuration
│   │   ├── flows/          # Contains all Genkit flows
│   │   └── genkit.ts       # Genkit initialization
│   ├── hooks/              # Custom React hooks
│   │   └── use-toast.ts    # Hook for showing toast notifications
│   └── lib/                # Core libraries, utilities, and config
│       ├── default-files.ts# Default project files for new users
│       ├── firebase.ts     # Firebase initialization
│       ├── store.ts        # Zustand store for global state management
│       └── utils.ts        # Utility functions
├── package.json            # Project dependencies and scripts
└── tailwind.config.ts      # Tailwind CSS configuration
```

---

## 4. Key Architectural Concepts

### 4.1. Global State Management with Zustand

The entire state of the application is managed in a single global store powered by Zustand (`src/lib/store.ts`). This centralized approach provides several benefits:

- **Single Source of Truth**: All application state, including the file tree, open files, commits, AI history, and user settings, lives in one place.
- **Decoupled Components**: Components do not manage complex state themselves; they simply subscribe to the parts of the store they need and call actions to update the state.
- **Persistence Logic**: The store is responsible for all interactions with Firebase. Actions like `saveProject` and `loadProject` are defined within the store, abstracting away the database logic from the UI.
- **Complex State Transitions**: All logic for creating, renaming, deleting, and committing files is encapsulated in the store's actions, ensuring that state transitions are predictable and consistent.

### 4.2. AI Integration with Genkit

The AI functionality is powered by Genkit, an open-source framework for building production-ready AI applications.

- **Server-Side Flows**: All AI logic is defined in server-side Genkit flows (`src/ai/flows/`). This keeps prompts and business logic secure and allows the AI to perform complex tasks without being limited by the client.
- **Structured I/O with Zod**: Genkit flows use Zod schemas to define their input and output structures. This ensures that the AI receives and returns data in a predictable format, which is crucial for reliable automation.
- **The `editCode` Flow**: This is the most powerful flow in the application. It receives a user's prompt and the context of the open project files. It is prompted to act as an expert developer and returns a structured JSON object containing a description of its plan, a list of file modifications, and a suggested commit message. This structured output is then used to apply changes and automate commits.

### 4.3. Data Persistence with Firebase

Firebase is used for both user authentication and data storage, making the application truly cloud-native.

- **Authentication**: `firebase/auth` handles user sign-up, login, and session management.
- **Firestore Database**: A single Firestore document per user stores their entire project. The `projects/{userId}` document contains the file tree, commit history, AI conversation, and settings. This architecture is simple, scalable, and ensures complete data isolation between users.
- **Saving and Loading**: The Zustand store orchestrates the saving and loading of project data to/from Firestore, providing a seamless experience where users can pick up their work on any device.

### 4.4. The Main IDE Interface: `CodePilotPage`

The `src/components/codepilot-page.tsx` component is the orchestrator for the entire IDE interface.

- **Dynamic Layout**: It uses `ResizablePanelGroup` to create the familiar, resizable layout of an IDE.
- **Editor and Terminal**: It dynamically loads the Monaco Editor and xterm.js components, which are heavy and not suitable for server-side rendering.
- **State Subscription**: It connects to the Zustand store to get the list of open files, the active file's content, and other UI-related state.
- **Event Handling**: It contains the logic for handling major events like running code, exporting the project, and responding to keyboard shortcuts.

---

## 5. Getting Started

To run this project locally, you will need to have Node.js and npm installed.

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Firebase**
    - The project is pre-configured with a Firebase project. No additional setup is required to run it.

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```

This will start the Next.js development server, typically on `http://localhost:9002`. Open this URL in your browser to start using CodePilot.

# **App Name**: CodePilot

## Core Features:

- Monaco Editor Integration: Integrate the Monaco Editor for code editing with syntax highlighting for JavaScript, HTML, CSS, and Python.
- File System Management: Implement a sidebar file tree to add, delete, rename, and open files within the editor.
- Code Execution Environment: Run HTML/CSS/JS files in an iframe preview panel. For Python, send code to a Firebase Cloud Function for execution and display output in a console panel.
- Workspace UI Layout: Split view layout featuring a left sidebar for files, center editor, and bottom panel for console output, including a dark/light theme toggle.
- Firebase Authentication: Enable Firebase Authentication with Email/Password and Google login to manage user sessions. Use local storage for unauthenticated user persistence.
- Automated Code Assistant: Employ generative AI to suggest code improvements in the currently active buffer; the tool intelligently uses program analysis to decide when to suggest improvements.
- Project Export: Implement functionality to export the project as a ZIP file for local backup and portability.

## Style Guidelines:

- Primary color: Indigo (#4F46E5) to provide a focused coding environment.
- Background color: Dark gray (#1F2937) for a modern, dark-themed interface, reducing eye strain.
- Accent color: Teal (#14B8A6) to highlight interactive elements and code output for better readability.
- Body and headline font: 'Inter' sans-serif, providing a modern and clean look suitable for both headlines and body text.
- Use minimalist icons from a set like 'Font Awesome' to represent file actions, run commands, and settings.
- Implement a split-view layout using TailwindCSS grid to manage the file sidebar, code editor, and console panel effectively.
- Subtle transitions and animations (e.g., file opening/closing) to enhance user experience without being intrusive.
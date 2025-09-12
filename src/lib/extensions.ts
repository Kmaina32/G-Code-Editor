export interface Extension {
  id: string;
  name: string;
  description: string;
  type: "theme" | "formatter" | "panel";
  installed: boolean;
}

export const defaultExtensions: Extension[] = [
  {
    id: "theme-dark",
    name: "Default Dark",
    description: "The default CodePilot dark theme.",
    type: "theme",
    installed: true,
  },
  {
    id: "theme-light",
    name: "Default Light",
    description: "The default CodePilot light theme.",
    type: "theme",
    installed: true,
  },
  {
    id: "theme-matrix",
    name: "Matrix",
    description: "A green, hacker-style theme.",
    type: "theme",
    installed: false,
  },
  {
    id: "theme-dracula",
    name: "Dracula",
    description: "A popular dark theme for developers.",
    type: "theme",
    installed: false,
  },
  {
    id: "theme-solarized-light",
    name: "Solarized Light",
    description: "A classic low-contrast light theme.",
    type: "theme",
    installed: false,
  },
];

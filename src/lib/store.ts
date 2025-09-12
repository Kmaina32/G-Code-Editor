import { create } from 'zustand';
import { defaultFiles } from './default-files';
import { defaultExtensions, Extension } from './extensions';

export interface File {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified?: boolean;
}

export interface Commit {
  id: string;
  message: string;
  createdAt: string;
  files: File[];
}

export interface EditorSettings {
  fontSize: number;
}

interface StoreState {
  files: File[];
  openFileIds: string[];
  activeFileId: string | null;
  isLoading: boolean;
  fileToDelete: string | null;
  extensions: Extension[];
  editorSettings: EditorSettings;
  commits: Commit[];
}

interface StoreActions {
  loadInitialFiles: () => void;
  addFile: (name: string) => void;
  deleteFile: (id: string) => void;
  setFileToDelete: (id: string | null) => void;
  renameFile: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
  setEditorSettings: (settings: Partial<EditorSettings>) => void;
  commitChanges: (message: string) => void;
}

const getLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop();
  switch (extension) {
    case 'js':
      return 'javascript';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'ts':
      return 'typescript';
    default:
      return 'plaintext';
  }
};

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  files: [],
  openFileIds: [],
  activeFileId: null,
  isLoading: true,
  fileToDelete: null,
  extensions: defaultExtensions,
  editorSettings: {
    fontSize: 14,
  },
  commits: [],

  setEditorSettings: (settings) => {
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    }));
  },

  loadInitialFiles: () => {
    const initialFiles = defaultFiles.map((file, index) => ({
      ...file,
      id: `file-${index}-${Date.now()}`,
      isModified: false,
    }));
    set({
      files: initialFiles,
      openFileIds: [initialFiles[0].id],
      activeFileId: initialFiles[0].id,
      isLoading: false,
    });
  },

  addFile: (name) => {
    const newFile: File = {
      id: `file-${get().files.length}-${Date.now()}`,
      name,
      language: getLanguage(name),
      content: '',
      isModified: true, // New files are considered "modified"
    };
    set((state) => ({
      files: [...state.files, newFile],
      openFileIds: [...state.openFileIds, newFile.id],
      activeFileId: newFile.id,
    }));
  },

  deleteFile: (id) => {
    set((state) => {
      const newOpenFileIds = state.openFileIds.filter((fileId) => fileId !== id);
      let newActiveFileId = state.activeFileId;
      if (state.activeFileId === id) {
        const closingIndex = state.openFileIds.findIndex(
          (fileId) => fileId === id
        );
        if (newOpenFileIds.length > 0) {
          newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)];
        } else {
          newActiveFileId = null;
        }
      }
      return {
        files: state.files.filter((file) => file.id !== id),
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
      };
    });
  },

  setFileToDelete: (id) => set({ fileToDelete: id }),

  renameFile: (id, newName) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id
          ? {
              ...file,
              name: newName,
              language: getLanguage(newName),
              isModified: true,
            }
          : file
      ),
    }));
  },

  updateFileContent: (id, content) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, content, isModified: true } : file
      ),
    }));
  },

  openFile: (id) => {
    if (!get().openFileIds.includes(id)) {
      set((state) => ({ openFileIds: [...state.openFileIds, id] }));
    }
    set({ activeFileId: id });
  },

  closeFile: (id) => {
    const { openFileIds, activeFileId } = get();
    const newOpenFileIds = openFileIds.filter((fileId) => fileId !== id);
    let newActiveFileId = activeFileId;

    if (activeFileId === id) {
      const closingIndex = openFileIds.findIndex((fileId) => fileId === id);
      if (newOpenFileIds.length > 0) {
        newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)];
      } else {
        newActiveFileId = null;
      }
    }
    set({ openFileIds: newOpenFileIds, activeFileId: newActiveFileId });
  },

  setActiveFile: (id) => {
    set({ activeFileId: id });
  },

  installExtension: (id: string) => {
    set((state) => ({
      extensions: state.extensions.map((ext) => {
        if (ext.id === id) {
          return { ...ext, installed: true };
        }
        // If it's a theme, uninstall other themes
        const updatedExt = {...ext};
        if (updatedExt.type === 'theme') {
          const newExt = state.extensions.find(e => e.id === id);
          if (newExt?.type === 'theme') {
            updatedExt.installed = false;
          }
        }
        return updatedExt;
      }),
    }));
  },

  uninstallExtension: (id: string) => {
    set((state) => ({
      extensions: state.extensions.map((ext) =>
        ext.id === id ? { ...ext, installed: false } : ext
      ),
    }));
  },

  commitChanges: (message: string) => {
    const { files } = get();
    const modifiedFiles = files.filter(file => file.isModified);
    if(modifiedFiles.length === 0) return;

    const newCommit: Commit = {
      id: `commit-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      files: modifiedFiles.map(f => ({...f})) // Create a snapshot
    };
    
    set(state => ({
      commits: [newCommit, ...state.commits],
      files: state.files.map(file => ({...file, isModified: false}))
    }))
  }
}));
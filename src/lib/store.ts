import { create } from 'zustand';
import { defaultFiles } from './default-files';

export interface File {
  id: string;
  name: string;
  language: string;
  content: string;
}

interface StoreState {
  files: File[];
  openFileIds: string[];
  activeFileId: string | null;
}

interface StoreActions {
  loadInitialFiles: () => void;
  addFile: (name: string) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
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

  loadInitialFiles: () => {
    const initialFiles = defaultFiles.map((file, index) => ({
      ...file,
      id: `file-${index}-${Date.now()}`,
    }));
    set({
      files: initialFiles,
      openFileIds: [initialFiles[0].id],
      activeFileId: initialFiles[0].id,
    });
  },

  addFile: (name) => {
    const newFile: File = {
      id: `file-${get().files.length}-${Date.now()}`,
      name,
      language: getLanguage(name),
      content: '',
    };
    set((state) => ({ files: [...state.files, newFile] }));
  },

  deleteFile: (id) => {
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
      openFileIds: state.openFileIds.filter((fileId) => fileId !== id),
      activeFileId: state.activeFileId === id ? state.openFileIds[0] || null : state.activeFileId,
    }));
  },

  renameFile: (id, newName) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, name: newName, language: getLanguage(newName) } : file
      ),
    }));
  },

  updateFileContent: (id, content) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, content } : file
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
}));

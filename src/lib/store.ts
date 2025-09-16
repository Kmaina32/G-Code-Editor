
import { create } from 'zustand';
import { defaultFileTree } from './default-files';
import { defaultExtensions, Extension } from './extensions';

export type File = {
  id: string;
  name: string;
  language: string;
  content: string;
  type: 'file';
  path: string;
  isModified?: boolean;
  isReadOnly?: boolean;
  originalId?: string;
};

export type Folder = {
  id: string;
  name: string;
  type: 'folder';
  path: string;
  children: FileSystemItem[];
  isOpen?: boolean;
};

export type FileSystemItem = File | Folder;

export interface Commit {
  id:string;
  message: string;
  createdAt: string;
  files: File[];
}

export interface EditorSettings {
  fontSize: number;
}

// Helper function to flatten the tree into a list of files
const flattenTree = (items: FileSystemItem[]): File[] => {
  let files: File[] = [];
  for (const item of items) {
    if (item.type === 'file') {
      files.push(item);
    } else {
      files = files.concat(flattenTree(item.children));
    }
  }
  return files;
};

// Helper to find a file by ID in the tree
const findFileById = (
  items: FileSystemItem[],
  id: string
): File | undefined => {
  for (const item of items) {
    if (item.type === 'file' && item.id === id) {
      return item;
    }
    if (item.type === 'folder') {
      const found = findFileById(item.children, id);
      if (found) return found;
    }
  }
  return undefined;
};


// Recursive function to add an item
const addItemToTree = (
  items: FileSystemItem[],
  parentId: string | null,
  newItem: FileSystemItem
): FileSystemItem[] => {
    if (parentId === null) {
        return [...items, newItem];
    }
    return items.map(item => {
        if (item.id === parentId && item.type === 'folder') {
            return { ...item, children: [...item.children, newItem] };
        }
        if (item.type === 'folder') {
            return { ...item, children: addItemToTree(item.children, parentId, newItem) };
        }
        return item;
    });
};

// Recursive function to remove an item
const removeItemFromTree = (items: FileSystemItem[], id: string): FileSystemItem[] => {
    return items.filter(item => item.id !== id).map(item => {
        if (item.type === 'folder') {
            return { ...item, children: removeItemFromTree(item.children, id) };
        }
        return item;
    });
};


// Recursive function to rename an item and update paths
const renameItemInTree = (items: FileSystemItem[], id: string, newName: string, parentPath: string): FileSystemItem[] => {
    return items.map(item => {
        const newPath = `${parentPath}/${newName}`;
        if (item.id === id) {
            const updatedItem = { ...item, name: newName, path: newPath };
            if(updatedItem.type === 'file') {
                return {...updatedItem, language: getLanguage(newName)}
            }
             if (updatedItem.type === 'folder') {
                return { ...updatedItem, children: updatedItem.children.map(child => ({ ...child, path: `${newPath}/${child.name}` })) };
            }
            return updatedItem;
        }
        if (item.type === 'folder') {
            return { ...item, children: renameItemInTree(item.children, id, newName, item.path) };
        }
        return item;
    });
};

// Recursive function to update file content
const updateFileContentInTree = (items: FileSystemItem[], id: string, content: string): FileSystemItem[] => {
    return items.map(item => {
        if (item.type === 'file' && item.id === id && !item.isReadOnly) {
            return { ...item, content, isModified: true };
        }
        if (item.type === 'folder') {
            return { ...item, children: updateFileContentInTree(item.children, id, content) };
        }
        return item;
    });
};

// Recursive function to toggle a folder's open state
const toggleFolderInTree = (items: FileSystemItem[], id: string): FileSystemItem[] => {
    return items.map(item => {
        if (item.type === 'folder' && item.id === id) {
            return { ...item, isOpen: !item.isOpen };
        }
        if (item.type === 'folder') {
            return { ...item, children: toggleFolderInTree(item.children, id) };
        }
        return item;
    });
};


interface StoreState {
  fileTree: FileSystemItem[];
  openFileIds: string[];
  activeFileId: string | null;
  isLoading: boolean;
  fileToDelete: string | null;
  extensions: Extension[];
  editorSettings: EditorSettings;
  commits: Commit[];
  activeThemeId: string;
}

interface StoreActions {
  loadInitialFiles: () => void;
  addFile: (name: string, parentId?: string | null) => void;
  addFolder: (name: string, parentId?: string | null) => void;
  deleteItem: (id: string) => void;
  setFileToDelete: (id: string | null) => void;
  renameItem: (id: string, newName: string) => void;
  updateFileContent: (id: string, content: string) => void;
  openFile: (id: string) => void;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  installExtension: (id: string) => void;
  uninstallExtension: (id: string) => void;
  setEditorSettings: (settings: Partial<EditorSettings>) => void;
  commitChanges: (message: string) => void;
  setActiveThemeId: (id: string) => void;
  viewCommit: (commitId: string) => void;
  toggleFolder: (id: string) => void;
  getFiles: () => File[];
  findFile: (id: string) => File | undefined;
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
  fileTree: [],
  openFileIds: [],
  activeFileId: null,
  isLoading: true,
  fileToDelete: null,
  extensions: defaultExtensions,
  editorSettings: {
    fontSize: 14,
  },
  commits: [],
  activeThemeId: 'theme-dark',

  setEditorSettings: (settings) => {
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    }));
  },

  setActiveThemeId: (id: string) => set({ activeThemeId: id }),

  loadInitialFiles: () => {
    const initialFiles = flattenTree(defaultFileTree);
    set({
      fileTree: defaultFileTree,
      openFileIds: [initialFiles[0].id],
      activeFileId: initialFiles[0].id,
      isLoading: false,
    });
  },
  
  getFiles: () => flattenTree(get().fileTree),

  findFile: (id) => findFileById(get().fileTree, id),

  addFile: (name, parentId = null) => {
    let parentPath = '';
    const findParent = (items: FileSystemItem[], id: string | null): FileSystemItem | null => {
        if (id === null) return null;
        for (const item of items) {
            if (item.id === id) return item;
            if (item.type === 'folder') {
                const found = findParent(item.children, id);
                if (found) return found;
            }
        }
        return null;
    }
    const parent = findParent(get().fileTree, parentId);
    if(parent) parentPath = parent.path;

    const newFile: File = {
      id: `file-${Math.random()}`,
      name,
      language: getLanguage(name),
      content: '',
      type: 'file',
      path: parentId ? `${parentPath}/${name}` : `/${name}`,
      isModified: true,
    };
    set((state) => ({
      fileTree: addItemToTree(state.fileTree, parentId, newFile),
      openFileIds: [...state.openFileIds, newFile.id],
      activeFileId: newFile.id,
    }));
  },

  addFolder: (name, parentId = null) => {
    let parentPath = '';
    const findParent = (items: FileSystemItem[], id: string | null): FileSystemItem | null => {
        if (id === null) return null;
        for (const item of items) {
            if (item.id === id) return item;
            if (item.type === 'folder') {
                const found = findParent(item.children, id);
                if (found) return found;
            }
        }
        return null;
    }
    const parent = findParent(get().fileTree, parentId);
    if(parent) parentPath = parent.path;

    const newFolder: Folder = {
      id: `folder-${Math.random()}`,
      name,
      type: 'folder',
      path: parentId ? `${parentPath}/${name}` : `/${name}`,
      children: [],
      isOpen: true
    };
    set(state => ({
        fileTree: addItemToTree(state.fileTree, parentId, newFolder)
    }));
  },


  deleteItem: (id) => {
    const file = get().findFile(id);
    if(file?.isReadOnly){
      get().closeFile(id);
      return;
    }

    set((state) => {
      const allFiles = flattenTree(state.fileTree);
      const itemToDelete = allFiles.find(f => f.id === id);
      const filesToClose = itemToDelete && itemToDelete.type === 'folder' 
        ? flattenTree([itemToDelete]).map(f => f.id)
        : [id];

      const newOpenFileIds = state.openFileIds.filter((fileId) => !filesToClose.includes(fileId));
      let newActiveFileId = state.activeFileId;

      if (state.activeFileId && filesToClose.includes(state.activeFileId)) {
        const closingIndex = state.openFileIds.findIndex(
          (fileId) => fileId === state.activeFileId
        );
        if (newOpenFileIds.length > 0) {
          newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)];
        } else {
          newActiveFileId = null;
        }
      }
      return {
        fileTree: removeItemFromTree(state.fileTree, id),
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
      };
    });
  },

  setFileToDelete: (id) => set({ fileToDelete: id }),
  
  renameItem: (id, newName) => {
    set((state) => ({
      fileTree: renameItemInTree(state.fileTree, id, newName, '')
    }));
  },
  
  updateFileContent: (id, content) => {
    set((state) => ({
      fileTree: updateFileContentInTree(state.fileTree, id, content),
    }));
  },

  openFile: (id) => {
    if (!get().openFileIds.includes(id)) {
      set((state) => ({ openFileIds: [...state.openFileIds, id] }));
    }
    set({ activeFileId: id });
  },

  toggleFolder: (id) => {
    set(state => ({
      fileTree: toggleFolderInTree(state.fileTree, id)
    }));
  },

  closeFile: (id) => {
    const { openFileIds, activeFileId, fileTree } = get();
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
    
    const fileToClose = findFileById(fileTree, id);
    const newFileTree = fileToClose?.isReadOnly
      ? removeItemFromTree(fileTree, id)
      : fileTree;

    set({ fileTree: newFileTree, openFileIds: newOpenFileIds, activeFileId: newActiveFileId });
  },

  setActiveFile: (id) => {
    set({ activeFileId: id });
  },

  installExtension: (id: string) => {
    set((state) => ({
      extensions: state.extensions.map((ext) =>
        ext.id === id ? { ...ext, installed: true } : ext
      ),
    }));
  },

  uninstallExtension: (id: string) => {
    set((state) => ({
      extensions: state.extensions.map((ext) =>
        ext.id === id ? { ...ext, installed: false } : ext
      ),
      activeThemeId:
        state.activeThemeId === id ? 'theme-dark' : state.activeThemeId,
    }));
  },
  
  commitChanges: (message: string) => {
    const files = get().getFiles();
    const modifiedFiles = files.filter(file => file.isModified && !file.isReadOnly);
    if (modifiedFiles.length === 0) return;

    const newCommit: Commit = {
      id: `commit-${Date.now()}`,
      message,
      createdAt: new Date().toISOString(),
      files: JSON.parse(JSON.stringify(modifiedFiles.map(f => ({ ...f, isModified: false }))))
    };

    const markAsUnmodified = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.map(item => {
        if (item.type === 'file') {
          return { ...item, isModified: false };
        }
        return { ...item, children: markAsUnmodified(item.children) };
      });
    };

    set(state => ({
      commits: [newCommit, ...state.commits],
      fileTree: markAsUnmodified(state.fileTree),
    }));
  },


  viewCommit: (commitId: string) => {
    const { commits, fileTree, openFileIds } = get();
    const commit = commits.find(c => c.id === commitId);
    if (!commit) return;

    const nonHistoricalFileTree = removeItemFromTree(fileTree, 'hist-commit');
    const nonHistoricalOpenFileIds = openFileIds.filter(id => findFileById(nonHistoricalFileTree, id));
    
    const historicalFiles: File[] = commit.files.map(file => ({
      ...file,
      id: `hist-${commit.id}-${file.originalId || file.id}`,
      isReadOnly: true,
      isModified: false,
    }));

    const historicalFolder: Folder = {
      id: `hist-commit`,
      name: `Commit: ${commit.message.substring(0, 20)}...`,
      type: 'folder',
      path: '/commit',
      isOpen: true,
      children: historicalFiles
    };

    set({
      fileTree: [historicalFolder, ...nonHistoricalFileTree],
      openFileIds: [...nonHistoricalOpenFileIds, ...historicalFiles.map(f => f.id)],
      activeFileId: historicalFiles[0]?.id || null,
    });
  }
}));


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
    } else if (item.type === 'folder' && item.children) {
      files = files.concat(flattenTree(item.children));
    }
  }
  return files;
};

// Helper to find an item by ID in the tree
const findItemById = (
  items: FileSystemItem[],
  id: string
): FileSystemItem | undefined => {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }
    if (item.type === 'folder' && item.children) {
      const found = findItemById(item.children, id);
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
            return { ...item, children: [...(item.children || []), newItem] };
        }
        if (item.type === 'folder' && item.children) {
            return { ...item, children: addItemToTree(item.children, parentId, newItem) };
        }
        return item;
    });
};

// Recursive function to remove an item
const removeItemFromTree = (items: FileSystemItem[], id: string): FileSystemItem[] => {
    return items.filter(item => item.id !== id).map(item => {
        if (item.type === 'folder' && item.children) {
            return { ...item, children: removeItemFromTree(item.children, id) };
        }
        return item;
    });
};


// Recursive function to rename an item and update paths
const renameItemInTree = (items: FileSystemItem[], id: string, newName: string): FileSystemItem[] => {
    const updatePath = (item: FileSystemItem, parentPath: string): FileSystemItem => {
        const updatedItem = { ...item, path: `${parentPath}/${item.name}`};
        if (updatedItem.type === 'folder' && updatedItem.children) {
            updatedItem.children = updatedItem.children.map(child => updatePath(child, updatedItem.path));
        }
        return updatedItem;
    }
    
    return items.map(item => {
        if (item.id === id) {
            const updatedItem = { ...item, name: newName };
            if(updatedItem.type === 'file') {
                return {...updatedItem, language: getLanguage(newName)}
            }
            if (updatedItem.type === 'folder' && updatedItem.children) {
               return { ...updatedItem, children: updatedItem.children.map(child => updatePath(child, updatedItem.path)) };
            }
            return updatedItem;
        }
        if (item.type === 'folder' && item.children) {
            return { ...item, children: renameItemInTree(item.children, id, newName) };
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
        if (item.type === 'folder' && item.children) {
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
        if (item.type === 'folder' && item.children) {
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
  isGenerating: boolean;
  fileToDelete: string | null;
  extensions: Extension[];
  editorSettings: EditorSettings;
  commits: Commit[];
  activeThemeId: string;
}

interface StoreActions {
  loadInitialFiles: () => void;
  addFile: (name: string, parentId: string | null) => void;
  addFolder: (name: string, parentId: string | null) => void;
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
  setIsGenerating: (isGenerating: boolean) => void;
}

const getLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
        return 'markdown';
    default:
      return 'plaintext';
  }
};

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  fileTree: [],
  openFileIds: [],
  activeFileId: null,
  isLoading: true,
  isGenerating: false,
  fileToDelete: null,
  extensions: defaultExtensions,
  editorSettings: {
    fontSize: 14,
  },
  commits: [],
  activeThemeId: 'theme-dark',
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),

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
      openFileIds: initialFiles.length > 0 ? [initialFiles[0].id] : [],
      activeFileId: initialFiles.length > 0 ? initialFiles[0].id : null,
      isLoading: false,
    });
  },
  
  getFiles: () => flattenTree(get().fileTree),

  findFile: (id) => {
     const item = findItemById(get().fileTree, id);
     return item?.type === 'file' ? item : undefined;
  },

  addFile: (name, parentId = null) => {
    let parentPath = '';
    if(parentId){
      const parent = findItemById(get().fileTree, parentId);
      if(parent) parentPath = parent.path;
    }

    const newFile: File = {
      id: `file-${Date.now()}`,
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
    if(parentId){
       const parent = findItemById(get().fileTree, parentId);
       if(parent) parentPath = parent.path;
    }

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
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
    const itemToDelete = findItemById(get().fileTree, id);
    if(!itemToDelete) return;

    // Handle read-only case (for commit history view)
    if (itemToDelete.type === 'file' && itemToDelete.isReadOnly) {
      get().closeFile(id);
      return;
    }
     if (itemToDelete.type === 'folder' && get().commits.some(c => c.id === itemToDelete.id)) {
      set(state => ({
        fileTree: removeItemFromTree(state.fileTree, id)
      }));
      return;
    }

    set((state) => {
      const filesToClose = itemToDelete.type === 'folder' 
        ? flattenTree([itemToDelete]).map(f => f.id)
        : [id];

      const newOpenFileIds = state.openFileIds.filter((fileId) => !filesToClose.includes(fileId));
      let newActiveFileId = state.activeFileId;

      if (state.activeFileId && filesToClose.includes(state.activeFileId)) {
        const closingIndex = state.openFileIds.indexOf(state.activeFileId);
        newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)] || null;
      }

      return {
        fileTree: removeItemFromTree(state.fileTree, id),
        openFileIds: newOpenFileIds,
        activeFileId: newActiveFileId,
        fileToDelete: null,
      };
    });
  },

  setFileToDelete: (id) => set({ fileToDelete: id }),
  
  renameItem: (id, newName) => {
    set((state) => ({
      fileTree: renameItemInTree(state.fileTree, id, newName)
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
    set(state => {
      const newOpenFileIds = state.openFileIds.filter((fileId) => fileId !== id);
      let newActiveFileId = state.activeFileId;

      if (state.activeFileId === id) {
        const closingIndex = state.openFileIds.indexOf(id);
        newActiveFileId = newOpenFileIds[Math.max(0, closingIndex - 1)] || null;
      }
      
      const itemToClose = findItemById(state.fileTree, id);
      let newFileTree = state.fileTree;

      if(itemToClose && 'isReadOnly' in itemToClose && itemToClose.isReadOnly) {
          // This is a temporary file from a commit history view, remove it completely
          newFileTree = removeItemFromTree(state.fileTree, id);
          
          // If the parent folder is also a temporary commit view, remove it if it's empty
          const parentFolderId = 'hist-commit';
          const parentFolder = findItemById(newFileTree, parentFolderId)
          if(parentFolder && parentFolder.type === 'folder' && parentFolder.children.length === 0){
             newFileTree = removeItemFromTree(newFileTree, parentFolderId)
          }
      }

      return { openFileIds: newOpenFileIds, activeFileId: newActiveFileId, fileTree: newFileTree };
    })
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
        if (item.type === 'folder' && item.children) {
          return { ...item, children: markAsUnmodified(item.children) };
        }
        return item;
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

    const existingHistFolder = findItemById(fileTree, 'hist-commit');
    let nonHistoricalFileTree = fileTree;
    if(existingHistFolder) {
      nonHistoricalFileTree = removeItemFromTree(fileTree, 'hist-commit');
    }

    const nonHistoricalOpenFileIds = openFileIds.filter(id => findItemById(nonHistoricalFileTree, id));
    
    const historicalFiles: File[] = commit.files.map(file => ({
      ...file,
      id: `hist-${commit.id}-${file.id}`,
      originalId: file.id,
      isReadOnly: true,
      isModified: false,
    }));

    const historicalFolder: Folder = {
      id: `hist-commit`,
      name: `Commit: ${commit.message.substring(0, 20)}...`,
      type: 'folder',
      path: '/commit_history',
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

    
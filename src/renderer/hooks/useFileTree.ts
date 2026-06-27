import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';
import type { FileNode } from '../../shared/types';

export function useFileTree() {
  const [rootPath, setRootPath] = useState<string | null>(null);
  const [tree, setTree] = useState<FileNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [gitStatuses, setGitStatuses] = useState<Record<string, { status: 'modified' | 'added' | 'deleted' | 'untracked' }> | null>(null);
  const [gitBranch, setGitBranch] = useState<string | null>(null);

  const openFolder = useCallback(async (folderPath?: string) => {
    const api = getAPI();
    const path = folderPath || await api.openFolderDialog();
    if (!path) return;

    setRootPath(path);
    const nodes = await api.readDir(path);
    setTree(nodes);

    const statuses = await api.gitStatus(path).catch(() => null);
    setGitStatuses(statuses);

    const branch = await api.gitBranch(path).catch(() => null);
    setGitBranch(branch);

    api.watchFolder(path).catch(() => {});
  }, []);

  const refreshTree = useCallback(async () => {
    if (!rootPath) return;
    const api = getAPI();
    const nodes = await api.readDir(rootPath);
    setTree(nodes);
  }, [rootPath]);

  const refreshTreeRef = useRef(refreshTree);
  refreshTreeRef.current = refreshTree;

  useEffect(() => {
    const api = getAPI();
    const cleanup = api.onFileTreeChanged(() => {
      refreshTreeRef.current();
    });
    return () => {
      cleanup();
      api.unwatchFolder().catch(() => {});
    };
  }, []);

  const toggleExpand = useCallback((nodePath: string) => {
    setTree(prev => expandNode(prev, nodePath));
  }, []);

  const loadChildren = useCallback(async (nodePath: string) => {
    const api = getAPI();
    const children = await api.readDir(nodePath);
    setTree(prev => replaceChildren(prev, nodePath, children));
  }, []);

  const createFile = useCallback(async (parentPath: string, name: string) => {
    const api = getAPI();
    const fullPath = await api.createFile(parentPath, name);
    await refreshTree();
    return fullPath;
  }, [refreshTree]);

  const createFolder = useCallback(async (parentPath: string, name: string) => {
    const api = getAPI();
    await api.createDir(parentPath, name);
    await refreshTree();
  }, [refreshTree]);

  const deleteEntry = useCallback(async (nodePath: string) => {
    const api = getAPI();
    await api.deletePath(nodePath);
    await refreshTree();
  }, [refreshTree]);

  const renameEntry = useCallback(async (oldPath: string, newName: string) => {
    const api = getAPI();
    const sep = oldPath.lastIndexOf('\\');
    const altSep = oldPath.lastIndexOf('/');
    const lastSep = Math.max(sep, altSep);
    const parentDir = lastSep > 0 ? oldPath.substring(0, lastSep) : '';
    const newPath = parentDir + (parentDir.includes('\\') ? '\\' : '/') + newName;
    await api.renamePath(oldPath, newPath);
    await refreshTree();
  }, [refreshTree]);

  return {
    rootPath, tree, selectedPath, setSelectedPath,
    openFolder, refreshTree, toggleExpand, loadChildren,
    createFile, createFolder, deleteEntry, renameEntry,
    gitStatuses, gitBranch,
  };
}

function expandNode(nodes: FileNode[], targetPath: string): FileNode[] {
  return nodes.map(node => {
    if (node.path === targetPath) {
      return { ...node, expanded: !node.expanded };
    }
    if (node.children) {
      return { ...node, children: expandNode(node.children, targetPath) };
    }
    return node;
  });
}

function replaceChildren(nodes: FileNode[], targetPath: string, children: FileNode[]): FileNode[] {
  return nodes.map(node => {
    if (node.path === targetPath) {
      return { ...node, children, expanded: true };
    }
    if (node.children) {
      return { ...node, children: replaceChildren(node.children, targetPath, children) };
    }
    return node;
  });
}

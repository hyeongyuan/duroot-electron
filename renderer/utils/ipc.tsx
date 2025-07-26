export const ipcHandler = {
  quit: () => {
    window.ipc.invoke('quit');
  },
  getVersion: async (): Promise<string> => {
    return await window.ipc.invoke('version');
  },
  openExternal: (url: string) => {
    window.ipc.openExternal(url);
  },
  getStorage: async (key: string): Promise<any> => {
    return await window.ipc.invoke('storage:get', key);
  },
  setStorage: async (key: string, value: any): Promise<void> => {
    await window.ipc.invoke('storage:set', key, value);
  },
  deleteStorage: async (key: string): Promise<void> => {
    await window.ipc.invoke('storage:delete', key);
  },
};

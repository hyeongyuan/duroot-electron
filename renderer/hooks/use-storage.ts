import { useEffect, useState } from "react";
import { ipcHandler } from "../utils/ipc";

export const useStorage = <T>(key: string, initialValue?: T): [T, (value: T) => Promise<void>] => {
  const [value, setValue] = useState<T>(initialValue ?? null);

  useEffect(() => {
    ipcHandler.getStorage(key).then((storedValue) => {
      if (storedValue === undefined) {
        return;
      }
      setValue(storedValue);
    });
  }, [key]);

  const updateValue = async (newValue: T) => {
    await ipcHandler.setStorage(key, newValue);
    const storedValue = await ipcHandler.getStorage(key);

    setValue(storedValue);
  };

  return [value, updateValue];
};

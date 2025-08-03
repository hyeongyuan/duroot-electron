import Store from 'electron-store';

export class LocalStorage {
  private _store: Store;

  constructor (name: string) {
    this._store = new Store({ name });
  }

  get<T = unknown> (key: string): T | undefined {
    return this._store.get(key) as T;
  }

  set (key: string, value: unknown) {
    this._store.set(key, value);
  }

  delete (key: string) {
    this._store.delete(key);
  }
}

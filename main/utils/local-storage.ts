import Store from 'electron-store';

export class LocalStorage {
  private _store: Store;

  constructor (name: string) {
    this._store = new Store({ name });
  }

  get (key: string) {
    return this._store.get(key);
  }

  set (key: string, value: any) {
    this._store.set(key, value);
  }
}
import axios from "axios";
import { app, shell } from "electron";

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';

type GithubAccessToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  scope: string;
};

type AuthCallback = (data: GithubAccessToken | null) => void;

export class Authwindow {
  private _options = {
    client_id: process.env.DUROOT_CLIENT_ID || '',
    client_secret: process.env.DUROOT_CLIENT_SECRET || '',
    scopes: ['user', 'repo', 'notifications'],
  };

  private _authorizeUrl = `${GITHUB_AUTHORIZE_URL}?client_id=${this._options.client_id}&scope=${this._options.scopes}`;
  private _callback: AuthCallback | null = null;

  constructor() {
    app.on('open-url', this._onWillRedirect.bind(this));
  }

  private async _onWillRedirect(_event: Electron.Event, url: string) {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'auth' && urlObj.searchParams.has('code')) {
      const code = urlObj.searchParams.get('code');
      
      const { data } = await axios.post<GithubAccessToken>(GITHUB_ACCESS_TOKEN_URL, {
        client_id: this._options.client_id,
        client_secret: this._options.client_secret,
        code: code,
      }, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (this._callback) {
        this._callback(data);
      }
    } else if (urlObj.searchParams.has('error')) {
      console.error('GitHub authentication error:', urlObj.searchParams.get('error'));
    }
  }

  async load(callback: (data: GithubAccessToken) => void) {
    this._callback = callback;

    shell.openExternal(this._authorizeUrl);
  }
}

import type { AxiosError } from "axios";
import type { Dispatch, SetStateAction } from "react";
import { fetchUser, isAuthorizedError, isNetworkError } from "../apis/github";
import type { GithubUser } from "../types/github";
import { ipcHandler } from "./ipc";

export type AuthRecoveryResult =
	| { status: "authorized"; token: string; user: GithubUser }
	| { status: "missing_token" }
	| { status: "unauthorized" }
	| { status: "network_error"; error: AxiosError }
	| { status: "error"; error: unknown };

export type AuthViewState = "loading" | "network_error";

export const recoverStoredAuthSession =
	async (): Promise<AuthRecoveryResult> => {
		const token = await ipcHandler.getStorage("auth.token");

		if (!token) {
			return { status: "missing_token" };
		}

		try {
			const user = await fetchUser(token);

			return { status: "authorized", token, user };
		} catch (error) {
			if (isAuthorizedError(error)) {
				return { status: "unauthorized" };
			}

			if (isNetworkError(error)) {
				return { status: "network_error", error };
			}

			return { status: "error", error };
		}
	};

export const clearAuthSession = async (
	setAuthData:
		| Dispatch<SetStateAction<{ user: GithubUser; token: string } | null>>
		| ((data: { user: GithubUser; token: string } | null) => void),
) => {
	await ipcHandler.deleteStorage("auth.token");
	setAuthData(null);
};

import { AuthNetworkError } from "@components/auth-network-error";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";
import type { GithubUser } from "../types/github";
import {
	type AuthViewState,
	clearAuthSession,
	recoverStoredAuthSession,
} from "../utils/auth";

export interface AuthProps {
	auth: GithubUser;
}

export const withAuth = <P extends AuthProps>(
	WrappedComponent: React.ComponentType<P>,
) => {
	const Component = (props: Omit<P, keyof AuthProps>) => {
		const router = useRouter();
		const { data: authData, setData: setAuthData } = useAuthStore();
		const [viewState, setViewState] = useState<AuthViewState>("loading");

		const restoreAuthSession = useCallback(async () => {
			setViewState("loading");

			const result = await recoverStoredAuthSession();

			switch (result.status) {
				case "authorized":
					setAuthData({ user: result.user, token: result.token });
					return;
				case "missing_token":
					setAuthData(null);
					router.replace("/auth");
					return;
				case "unauthorized":
					await clearAuthSession(setAuthData);
					router.replace("/auth");
					return;
				case "network_error":
					setViewState("network_error");
					return;
				case "error":
					setAuthData(null);
					router.replace("/auth");
					return;
			}
		}, [router, setAuthData]);

		useEffect(() => {
			if (authData) {
				return;
			}
			restoreAuthSession();
		}, [authData, restoreAuthSession]);

		if (!authData) {
			if (viewState === "network_error") {
				return <AuthNetworkError onRetry={restoreAuthSession} />;
			}
			return null;
		}
		return <WrappedComponent {...(props as P)} auth={authData} />;
	};
	return Component;
};

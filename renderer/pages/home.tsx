import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { fetchUser } from "../apis/github";
import { useAuthStore } from "../stores/auth";
import type { GithubAccessToken } from "../types/github";
import { ipcHandler } from "../utils/ipc";

export default function HomePage() {
	const router = useRouter();
	const { setData: setAuthData } = useAuthStore();

	useEffect(() => {
		ipcHandler.getStorage<GithubAccessToken>("github.auth").then(async (data) => {
			if (!data) {
				router.replace("/auth");
				return;
			}
			const { access_token: token } = data;
			try {
				const user = await fetchUser(token);

				setAuthData({ user, token });

				router.replace("/pulls");
			} catch (error) {
				await ipcHandler.deleteStorage("github.auth");

				router.replace("/auth");
			}
		});
	}, [router, setAuthData]);

	return null;
}

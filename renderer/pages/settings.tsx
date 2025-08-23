import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HEADER_HEIGHT } from "../components/header";
import { useAuthStore } from "../stores/auth";
import { ipcHandler } from "../utils/ipc";

export default function SettingsPage() {
	const router = useRouter();
	const { setData: setAuthData } = useAuthStore();
	const [version, setVersion] = useState("");

	useEffect(() => {
		ipcHandler.getVersion().then(setVersion);
	}, []);

	const handleSignOut = async () => {
		await ipcHandler.deleteStorage("auth.token");

		setAuthData(null);

		router.push("/auth");
	};

	return (
		<div className="w-full">
			<div
				style={{ height: HEADER_HEIGHT }}
				className="flex items-center border border-[#373e47] bg-[#2d333b] px-4"
			>
				<div className="mr-2 cursor-pointer" onClick={() => router.back()}>
					<svg
						width="20"
						height="20"
						viewBox="0 0 32 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							id="Vector"
							d="M23.3467 5.15999L20.9733 2.79999L7.78668 16L20.9867 29.2L23.3467 26.84L12.5067 16L23.3467 5.15999Z"
							fill="#e6edf3"
						/>
					</svg>
				</div>
				<h1 className="text-[#e6edf3]">Settings</h1>
			</div>
			<div className="pt-4">
				<section className="px-6 pb-4">
					<div className="m-2">
						<h2 className="text-[11px]">VERSION</h2>
					</div>
					<div className="divide-y divide-[#373e47] overflow-hidden rounded-lg bg-[#2d333b]">
						<div className="flex items-center justify-between px-4 py-2">
							<span>Duroot</span>
							<span className="text-[#768390]">v{version}</span>
						</div>
					</div>
				</section>
				<section className="px-6 pb-8">
					<div
						className="flex cursor-pointer items-center justify-between overflow-hidden rounded-lg bg-[#2d333b] px-4 py-2 hover:bg-[#373e47]"
						onClick={handleSignOut}
					>
						<span className="text-[#539BF5]">Sign out</span>
					</div>
				</section>
			</div>
		</div>
	);
}

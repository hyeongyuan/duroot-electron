import { AxiosError } from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { fetchUser } from "../apis/github";
import { Anchor } from "../components/common/anchor";
import { Input } from "../components/input";
import { ipcHandler } from "../utils/ipc";

const ERROR_MESSAGE: Record<number, string> = {
	401: "It is not a valid token.",
};

export default function AuthPage() {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async () => {
		setMessage("");
		try {
			await fetchUser(inputValue);

			await ipcHandler.setStorage("auth.token", inputValue);

			router.replace("/home");
		} catch (error) {
			if (error instanceof AxiosError) {
				const { status } = error.response || { status: 599 };
				setMessage(ERROR_MESSAGE[status] || error.message);
			}
		}
	};

	return (
		<>
			<div className="flex flex-1 justify-center">
				<div className="my-28">
					<div className="mb-24">
						<Image
							src="/images/logo.png"
							alt="Duroot Logo"
							width={240}
							height={80}
							unoptimized
							style={{ margin: "0 auto" }}
						/>
					</div>
					<div className="flex">
						<div className="mr-2">
							<Input
								placeholder="Please enter your token"
								value={inputValue}
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								onChange={(event) => setInputValue(event.target.value)}
							/>
							{!!message && (
								<p className="mt-2 ml-1 text-[#e5534b] text-xs">{message}</p>
							)}
						</div>
						<button
							type="button"
							className="h-[32px] rounded border border-[rgba(205,217,229,0.1)] bg-[#347d39] px-4 text-[#ffffff] text-sm hover:bg-[#46954a]"
							onClick={handleSubmit}
							disabled={!inputValue}
						>
							Submit
						</button>
					</div>
				</div>
			</div>
			<div>
				<p className="text-center text-xs">
					Don't have a token?{" "}
					<Anchor
						className="cursor-pointer text-[#4493f8] underline"
						href="https://github.com/settings/tokens"
					>
						Generate here
					</Anchor>
				</p>
			</div>
		</>
	);
}

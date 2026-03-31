import type { MouseEvent } from "react";
import { ipcHandler } from "../../utils/ipc";

interface AnchorProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode;
	href?: string;
}

export function Anchor({ children, href, ...props }: AnchorProps) {
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();

		if (!href) {
			return;
		}

		ipcHandler.openExternal(href);
	};
	return (
		<button type="button" onClick={handleClick} {...props}>
			{children}
		</button>
	);
}

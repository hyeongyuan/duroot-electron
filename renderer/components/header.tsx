import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "../stores/auth";
import { Avatar } from "./common/avatar";
import { Drawer } from "./drawer";

export const HEADER_HEIGHT = 44;

export function Header() {
	const pathname = usePathname();
	const { data } = useAuthStore();

	const [isOpen, setIsOpen] = useState(false);
	const elementRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = elementRef.current;
		const mousedownEventListener = (event: MouseEvent) => {
			if (element?.contains(event.target as Node)) {
				return;
			}
			setIsOpen(false);
		};
		window.addEventListener("mousedown", mousedownEventListener);
		return () => {
			window.removeEventListener("mousedown", mousedownEventListener);
		};
	}, []);

	useEffect(() => {
		const blurEventListener = () => {
			setIsOpen(false);
		};
		window.addEventListener("blur", blurEventListener);
		return () => {
			window.removeEventListener("blur", blurEventListener);
		};
	}, []);

	return (
		<div
			style={{ height: `${HEADER_HEIGHT}px` }}
			className="flex items-center justify-between bg-[#2d333b] border border-[#373e47] px-4"
		>
			<div className="flex gap-4">
				<a href="/pulls">
					<h1 className={`${pathname === "/pulls/" ? "text-[#e6edf3]" : ""}`}>
						Pulls
					</h1>
				</a>
			</div>
			<div className="relative select-none" ref={elementRef}>
				<div
					className="cursor-pointer"
					onClick={() => setIsOpen((prev) => !prev)}
				>
					<Avatar
						size={24}
						imageUrl={
							data
								? `https://avatars.githubusercontent.com/u/${data.user.id}?s=40&v=4`
								: ""
						}
					/>
				</div>
				<Drawer visible={isOpen} onClose={() => setIsOpen(false)} />
			</div>
		</div>
	);
}

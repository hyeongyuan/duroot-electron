import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ value, placeholder, onChange }: InputProps) {
	return (
		<div className="h-[33px] rounded border border-[#444c56] bg-[#1c2128] px-2 text-[#adbac7] text-sm">
			<input
				type="text"
				className="h-full w-full bg-transparent"
				value={value}
				placeholder={placeholder}
				onChange={onChange}
			/>
		</div>
	);
}

interface RoundButtonProps {
	label: string;
	onClick?: (event: React.MouseEvent) => void;
}

export function RoundButton({ label, onClick }: RoundButtonProps) {
	return (
		<button
			type="button"
			className="rounded-full border border-[#444c56] bg-[#373e47] px-[8px] py-[4px] font-medium text-[#adbac7] text-xs leading-[16px] hover:bg-[#3d444e]"
			onClick={onClick}
		>
			{label}
		</button>
	);
}

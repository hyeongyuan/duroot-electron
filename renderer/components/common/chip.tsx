interface ChipProps {
	label: string;
	selected?: boolean;
	onClick?: () => void;
	color?: string;
}

export function Chip({
	label,
	selected = false,
	onClick,
	color = "ec775c",
}: ChipProps) {
	return (
		<button
			type="button"
			className="h-[22px] text-xs leading-[18px] rounded-full px-[7px] border whitespace-nowrap transition-colors cursor-pointer"
			style={
				selected
					? {
							backgroundColor: `#${color}`,
							borderColor: `#${color}`,
							color: "#e6edf3",
						}
					: {
							backgroundColor: "#2d333b",
							borderColor: "#444c56",
							color: "#c9d1d9",
						}
			}
			onClick={onClick}
		>
			{label}
		</button>
	);
}

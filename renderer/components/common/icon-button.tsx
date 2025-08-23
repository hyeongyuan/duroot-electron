interface IconButtonProps {
	onClick?: () => void;
	children: React.ReactNode;
	tooltip?: string;
	disabled?: boolean;
}

export function IconButton({
	onClick,
	children,
	tooltip,
	disabled,
}: IconButtonProps) {
	return (
		<div className="tooltip tooltip-bottom" data-tip={tooltip}>
			<button
				type="button"
				className="cursor-pointer rounded border border-[#444c56] bg-[#373e47] p-[4px] hover:bg-[#3d444e]"
				onClick={onClick}
				disabled={disabled}
			>
				{children}
			</button>
		</div>
	);
}

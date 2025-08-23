export type Label = {
	name: string;
	color: string;
};

interface LabelProps extends Label {}

export function Label({ name, color }: LabelProps) {
	return (
		<span
			className="rounded-full border border-transparent px-[7px] text-xs leading-[18px]"
			style={{
				backgroundColor: `#${color}2e`,
				borderColor: `#${color}4d`,
				color: `#${color}`,
			}}
		>
			{name}
		</span>
	);
}

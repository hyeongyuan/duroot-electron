import { Chip } from "../common/chip";

type ChipFilter = {
	name: string;
	checked: boolean;
};

interface ChipsFilterProps {
	data: ChipFilter[];
	onChange?: (data: ChipFilter) => void;
	onReset?: () => void;
}

export function ChipsFilter({ data, onChange, onReset }: ChipsFilterProps) {
	const noLabel = data.length === 0;

	if (noLabel) {
		return null;
	}

	const hasActiveFilter = data.some(({ checked }) => checked);
	return (
		<div className="overflow-x-auto px-4 pb-1">
			<div className="flex min-w-max items-center gap-2">
				<Chip label="All" selected={!hasActiveFilter} onClick={onReset} />
				{data.map(({ name, checked }) => (
					<Chip
						key={name}
						label={name}
						selected={checked}
						onClick={() => onChange?.({ name, checked: !checked })}
					/>
				))}
			</div>
		</div>
	);
}

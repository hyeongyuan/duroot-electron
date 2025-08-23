import AdjustmentsHorizontalIcon from "@heroicons/react/24/solid/AdjustmentsHorizontalIcon";
import CheckIcon from "@heroicons/react/24/solid/CheckIcon";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "../common/icon-button";

type LabelFilter = {
	name: string;
	checked: boolean;
};

interface LabelsFilterProps {
	data: LabelFilter[];
	onChange?: (data: LabelFilter) => void;
}

export function LabelsFilter({ data, onChange }: LabelsFilterProps) {
	const [isOpen, setIsOpen] = useState(false);
	const elementRef = useRef<HTMLDivElement>(null);

	const toggleIsOpen = () => setIsOpen(!isOpen);

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

	const noLabel = data.length === 0;
	const tooltip = isOpen ? "" : noLabel ? "No label" : "Filter labels";

	return (
		<div className="relative" ref={elementRef}>
			<IconButton onClick={toggleIsOpen} tooltip={tooltip} disabled={noLabel}>
				<AdjustmentsHorizontalIcon className="size-4" />
			</IconButton>
			{isOpen && (
				<div
					id="dropdownDelay"
					style={{
						inset: "30px auto auto 0px",
						position: "absolute",
					}}
					className="absolute z-10 min-w-32 max-w-40 divide-y divide-gray-100 rounded-lg border border-[#444c56] bg-[#373e47] shadow-sm"
				>
					<ul
						className="py-1 text-gray-700 text-sm"
						aria-labelledby="dropdownDelayButton"
					>
						{data.map(({ name, checked }) => (
							<li
								key={name}
								className="mx-1 cursor-pointer"
								onClick={() => onChange?.({ name, checked: !checked })}
							>
								<div className="flex items-center rounded-md p-1 text-[#adbac7] hover:bg-[#3d444e] hover:text-[#e6edf3]">
									<div className="mr-2 flex h-4 w-4 items-center">
										{checked ? <CheckIcon className="size-4" /> : null}
									</div>
									<span className="overflow-hidden text-ellipsis text-sm">
										{name}
									</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}

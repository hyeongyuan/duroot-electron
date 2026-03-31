const SKELETON_ITEMS = 4;

export function PullsListSkeleton() {
	return (
		<div className="px-4" aria-busy="true" aria-live="polite">
			<span className="sr-only">Loading pull requests</span>
			<ul className="divide-y divide-[#373e47]">
				{Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
					<li key={index} className="py-3 animate-pulse">
						<div className="h-3 w-24 rounded bg-[#373e47]" />
						<div className="mt-3 h-4 w-3/6 rounded bg-[#3d444e]" />
						<div className="mt-3 flex items-center justify-between">
							<div className="h-3 w-32 rounded bg-[#373e47]" />
							<div className="h-3 w-14 rounded bg-[#2d333b]" />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

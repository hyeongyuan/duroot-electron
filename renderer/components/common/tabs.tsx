import Link from "next/link";

export const TABS_HEIGHT = 44;

export interface Tab {
	key: string;
	name: string;
	href: string;
	count?: number;
}

interface TabsProps {
	data: Tab[];
	activeTab: Tab["key"];
	shallowRouting?: boolean;
}

export function Tabs({ data, activeTab, shallowRouting }: TabsProps) {
	return (
		<ul
			style={{
				height: `${TABS_HEIGHT}px`,
				boxShadow: "inset 0 -1px 0 #373e47",
			}}
			className="overflow-y-auto whitespace-nowrap px-2"
		>
			{data.map(({ key, name, href, count }) => (
				<li
					key={key}
					className={`py-2 ${activeTab === key ? "border-[#ec775c]" : "border-[transparent]"} inline-block border-b-2`}
				>
					<Link
						href={href}
						className={`cursor-pointer p-2 text-xs ${activeTab === key ? "text-[#e6edf3]" : ""} hover:text-[#e6edf3]`}
						shallow={shallowRouting}
					>
						{name}
						{!!count && (
							<span className="ml-2 rounded-full bg-[rgba(99,110,123,0.4)] px-1">
								{count}
							</span>
						)}
					</Link>
				</li>
			))}
		</ul>
	);
}

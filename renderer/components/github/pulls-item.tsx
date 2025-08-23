import clsx from "clsx";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Anchor } from "../common/anchor";
import { Label } from "../common/label";

const getProfileUrl = (userId: number, size = 40) =>
	`https://avatars.githubusercontent.com/u/${userId}?s=${size}&v=4`;

interface PullsItemProps {
	title: string;
	titleUrl: string;
	subtitle: string;
	subtitleUrl: string;
	labels: {
		name: string;
		color: string;
	}[];
	user: {
		id: number;
		login: string;
	};
	createdAt: string;
}

export function PullsItem({
	title,
	titleUrl,
	subtitle,
	subtitleUrl,
	labels,
	user,
	createdAt,
}: PullsItemProps) {
	return (
		<li className="flex flex-col px-4 py-2">
			<div className="flex items-center">
				<Anchor
					className="line-clamp-1 break-all pr-1 text-[#768390] text-xs leading-5 hover:underline hover:underline-offset-1"
					href={subtitleUrl}
					target="_blank"
				>
					{subtitle}
				</Anchor>
			</div>
			<div className={labels.length > 0 ? "mb-1" : ""}>
				<Anchor
					className="line-clamp-3 break-all font-medium text-sm leading-6 hover:text-[#539bf5]"
					href={titleUrl}
					target="_blank"
				>
					{title}
				</Anchor>
			</div>
			<span
				className={clsx("flex flex-wrap gap-1 space-x-1", {
					"mb-1": labels.length > 0,
				})}
			>
				{labels.map(({ name, color }) => (
					<Label key={name} name={name} color={color} />
				))}
			</span>
			<div className="flex items-center text-[#768390]">
				<span className="flex items-center">
					<img
						className="mr-2 h-4 w-4 rounded-full"
						src={getProfileUrl(user.id, 32)}
						alt="avatar"
					/>
					<p className="line-clamp-1 break-all font-medium text-[#adbac7] text-[10px] leading-5">
						{user.login}
					</p>
				</span>
				<span className="mx-1">·</span>
				<span>
					<p className="line-clamp-1 break-all font-medium text-[10px] leading-5">
						{formatDistanceToNow(new Date(createdAt))}
					</p>
				</span>
			</div>
		</li>
	);
}

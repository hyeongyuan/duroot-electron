import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import { formatDistanceToNow } from "date-fns";

import { filterHideLabels } from "../../stores/pulls";
import type { GithubIssueItem } from "../../types/github";
import { ipcHandler } from "../../utils/ipc";
import { IconButton } from "../common/icon-button";
import { Empty } from "./empty";
import { type LabelFilter, LabelsFilter } from "./labels-filter";
import { MyPullsItem } from "./my-pulls-item";
import { PullsItem } from "./pulls-item";
import { TabKey } from "./pulls-tabs";


interface PullsListProps {
	pulls?: GithubIssueItem[];
	hideLabels: string[];
	tabQuery: TabKey;
	onClickReload?: () => void;
	onChangeLabelFilter?: (labelFilter: LabelFilter) => void;
}

export function PullsList({ pulls, hideLabels, tabQuery, onClickReload, onChangeLabelFilter }: PullsListProps) {
	if (!pulls) {
		return null;
	}
	if (pulls.length === 0) {
		return <Empty />;
	}

	const uniqueLabels = pulls
		.flatMap((pull) => pull.labels.map((label) => label.name))
		.filter((label, index, self) => self.indexOf(label) === index);
	const labelFilters = uniqueLabels.map((label) => ({
		name: label,
		checked: !hideLabels.includes(label),
	}));
	const filteredPulls = filterHideLabels(pulls, hideLabels);

	const handleClickOpenAll = () => {
		if (!pulls) {
			return;
		}
		const urls = filteredPulls.map((item) => item.html_url);
		for (const url of urls) {
			ipcHandler.openExternal(url);
		}
	};

	return (
		<>
			<div className="flex h-[26px] space-x-2 px-4">
				<IconButton onClick={onClickReload}>
					<ArrowPathIcon className="size-4" />
				</IconButton>
				<IconButton onClick={handleClickOpenAll} tooltip="Open all">
					<ArrowTopRightOnSquareIcon className="size-4" />
				</IconButton>
				<LabelsFilter data={labelFilters} onChange={onChangeLabelFilter} />
			</div>
			<ul className="divide-y divide-[#373e47]">
				{filteredPulls.map((pull) => {
					const [repo, owner] = pull.repository_url.split("/").reverse();
					const ownerRepo = `${owner}/${repo}`;
					const labels = pull.draft
						? [{ name: " Draft", color: "cdd9e5" }]
						: pull.labels.map((label) => ({
								name: label.name,
								color: label.color,
							}));

					if (tabQuery === TabKey.MY_PULL_REQUESTS) {
						return (
							<MyPullsItem
								key={pull.id}
								title={pull.title}
								titleUrl={pull.html_url}
								subtitle={ownerRepo}
								subtitleUrl={`https://github.com/${ownerRepo}`}
								labels={labels}
								caption={formatDistanceToNow(new Date(pull.created_at))}
								pullRequestUrl={pull.pull_request.url}
								draft={pull.draft}
							/>
						);
					}
					return (
						<PullsItem
							key={pull.id}
							title={pull.title}
							titleUrl={pull.html_url}
							subtitle={ownerRepo}
							subtitleUrl={`https://github.com/${ownerRepo}`}
							labels={labels}
							user={{
								id: pull.user.id,
								login: pull.user.login,
							}}
							createdAt={pull.created_at}
						/>
					);
				})}
			</ul>
		</>
	);
}

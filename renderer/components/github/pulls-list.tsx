import { formatDistanceToNow } from "date-fns";

import type { GithubIssueItem } from "../../types/github";
import { Empty } from "./empty";
import { MyPullsItem } from "./my-pulls-item";
import { PullsItem } from "./pulls-item";
import { TabKey } from "./pulls-tabs";

interface PullsListProps {
	pulls?: GithubIssueItem[];
	tabQuery: TabKey;
}

export function PullsList({ pulls, tabQuery }: PullsListProps) {
	if (!pulls) {
		return null;
	}
	if (pulls.length === 0) {
		return <Empty />;
	}
	return (
		<ul className="divide-y divide-[#373e47]">
			{pulls.map((pull) => {
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
	);
}

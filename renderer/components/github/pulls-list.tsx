import {
	ArrowPathIcon,
	ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { isAuthorizedError } from "../../apis/github";
import {
	queryApprovedPullRequests,
	queryMyPullRequests,
	queryRequestedPullRequests,
	queryReviewedPullRequests,
} from "../../queries/github";
import { useAuthStore } from "../../stores/auth";
import { filterHideLabels, usePullsHideLabelsStore } from "../../stores/pulls";
import { ipcHandler } from "../../utils/ipc";
import { IconButton } from "../common/icon-button";
import { Spinner } from "../common/spinner";
import { TABS_HEIGHT } from "../common/tabs";
import { HEADER_HEIGHT } from "../header";
import { Empty } from "./empty";
import { LabelsFilter } from "./labels-filter";
import { LastUpdateTimer } from "./last-update-timer";
import { MyPullsItem } from "./my-pulls-item";
import { PullsItem } from "./pulls-item";
import { TabKey } from "./pulls-tabs";

const WINDOW_HEIGHT = 500;
const HEADER_SECTION_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

export function PullsList() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tabQuery = (searchParams.get("tab") ||
		TabKey.MY_PULL_REQUESTS) as TabKey;
	const { data } = useAuthStore();
	const { data: hideLabels, set: setHideLabels } = usePullsHideLabelsStore();

	const {
		data: pulls,
		isLoading,
		isRefetching,
		error,
		refetch,
	} = useQuery({
		queryKey: ["pulls", tabQuery],
		queryFn: async () => {
			switch (tabQuery) {
				case TabKey.MY_PULL_REQUESTS:
					return queryMyPullRequests(data.token);
				case TabKey.REQUESTED_PULL_REQUESTS:
					return queryRequestedPullRequests(data.token);
				case TabKey.REVIEWED_PULL_REQUESTS:
					return queryReviewedPullRequests(data.token, data.user.login);
				case TabKey.APPROVED_PULL_REQUESTS:
					return queryApprovedPullRequests(data.token, data.user.login);
			}
		},
		enabled: !!data,
	});

	useEffect(() => {
		if (isAuthorizedError(error)) {
			ipcHandler.deleteStorage("auth.token").then(() => {
				router.replace("/auth");
			});
		}
	}, [error, router]);

	const onChangeLabelFilter = useCallback(
		(label: { name: string; checked: boolean }) => {
			const newHideLabels = label.checked
				? hideLabels.filter((item) => item !== label.name)
				: [...hideLabels, label.name];

			setHideLabels(newHideLabels);
		},
		[hideLabels, setHideLabels],
	);

	const renderList = useCallback(() => {
		if (!pulls) {
			return null;
		}
		if (pulls.items.length === 0) {
			return <Empty />;
		}

		const uniqueLabels = pulls.items
			.flatMap((pull) => pull.labels.map((label) => label.name))
			.filter((label, index, self) => self.indexOf(label) === index);
		const labelFilters = uniqueLabels.map((label) => ({
			name: label,
			checked: !hideLabels.includes(label),
		}));
		const filteredPulls = filterHideLabels(pulls.items, hideLabels);

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
					<IconButton onClick={refetch}>
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
	}, [pulls, refetch, hideLabels, onChangeLabelFilter, tabQuery]);

	return (
		<div
			style={{ height: `${WINDOW_HEIGHT - HEADER_SECTION_HEIGHT}px` }}
			className="overflow-y-auto"
		>
			<div className="py-2">
				<LastUpdateTimer lastUpdatedAt={pulls?.lastUpdatedAt ?? new Date()} />
			</div>
			{renderList()}
			<Spinner show={isLoading || isRefetching} />
		</div>
	);
}

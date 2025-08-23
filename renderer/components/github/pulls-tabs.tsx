import { useQueries } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { useEffect } from "react";
import {
	queryApprovedPullRequests,
	queryMyPullRequests,
	queryRequestedPullRequests,
	queryReviewedPullRequests,
} from "../../queries/github";
import { useAuthStore } from "../../stores/auth";
import { filterHideLabels, usePullsHideLabelsStore } from "../../stores/pulls";
import { ipcHandler } from "../../utils/ipc";
import { type Tab, Tabs } from "../common/tabs";

export enum TabKey {
	MY_PULL_REQUESTS = "myPullRequests",
	REQUESTED_PULL_REQUESTS = "requestedPullRequests",
	REVIEWED_PULL_REQUESTS = "reviewedPullRequests",
	APPROVED_PULL_REQUESTS = "approvedPullRequests",
	WATCHING_PULL_REQUESTS = "watchingPullRequests",
}

export function PullsTabs() {
	const searchParams = useSearchParams();
	const tabQuery = (searchParams.get("tab") ||
		TabKey.MY_PULL_REQUESTS) as TabKey;
	const { data } = useAuthStore();
	const { data: hideLabels } = usePullsHideLabelsStore();

	const [myPulls, requestedPulls, reviewedPulls, approvedPulls] = useQueries({
		queries: [
			{
				queryKey: ["pulls", TabKey.MY_PULL_REQUESTS],
				queryFn: () => queryMyPullRequests(data?.token ?? ''),
				enabled: !!data,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: ["pulls", TabKey.REQUESTED_PULL_REQUESTS],
				queryFn: () => queryRequestedPullRequests(data?.token ?? ''),
				enabled: !!data,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: ["pulls", TabKey.REVIEWED_PULL_REQUESTS],
				queryFn: () => queryReviewedPullRequests(data?.token ?? '', data?.user.login ?? ''),
				enabled: !!data,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: ["pulls", TabKey.APPROVED_PULL_REQUESTS],
				queryFn: () => queryApprovedPullRequests(data?.token ?? '', data?.user.login ?? ''),
				enabled: !!data,
				refetchOnWindowFocus: false,
			},
			{
				queryKey: ["pulls", TabKey.WATCHING_PULL_REQUESTS],
				queryFn: () => Promise.resolve({ items: [] }),
				enabled: !!data,
				refetchOnWindowFocus: false,
			}
		],
	});

	const tabs: Tab[] = [
		{
			key: TabKey.MY_PULL_REQUESTS,
			name: "My",
			href: `/pulls?tab=${TabKey.MY_PULL_REQUESTS}`,
			count: filterHideLabels(myPulls.data?.items ?? [], hideLabels).length,
		},
		{
			key: TabKey.REQUESTED_PULL_REQUESTS,
			name: "Requested",
			href: `/pulls?tab=${TabKey.REQUESTED_PULL_REQUESTS}`,
			count: filterHideLabels(requestedPulls.data?.items ?? [], hideLabels).length,
		},
		{
			key: TabKey.REVIEWED_PULL_REQUESTS,
			name: "Reviewed",
			href: `/pulls?tab=${TabKey.REVIEWED_PULL_REQUESTS}`,
			count: filterHideLabels(reviewedPulls.data?.items ?? [], hideLabels).length,
		},
		{
			key: TabKey.APPROVED_PULL_REQUESTS,
			name: "Approved",
			href: `/pulls?tab=${TabKey.APPROVED_PULL_REQUESTS}`,
			count: filterHideLabels(approvedPulls.data?.items ?? [], hideLabels).length,
		},
		{
			key: TabKey.WATCHING_PULL_REQUESTS,
			name: "👀",
			href: `/pulls?tab=${TabKey.WATCHING_PULL_REQUESTS}`,
			count: 0,
		}
	];
	const requestedPullsCount = tabs[1]?.count ?? 0;

	useEffect(() => {
		const trayIconName =
			requestedPullsCount > 0 ? "tray-icon-active.png" : "tray-icon.png";
		ipcHandler.setTrayIcon(trayIconName);
	}, [requestedPullsCount]);

	return <Tabs data={tabs} activeTab={tabQuery} />;
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { buildPullsQueryKey, queryPullsByTab } from "../../queries/github";
import { useAuthStore } from "../../stores/auth";
import {
	filterVisibleLabels,
	usePullsVisibleLabelsStore,
} from "../../stores/pulls";
import { ipcHandler } from "../../utils/ipc";
import { type Tab, Tabs } from "../common/tabs";

export enum TabKey {
	MY_PULL_REQUESTS = "myPullRequests",
	REQUESTED_PULL_REQUESTS = "requestedPullRequests",
	REVIEWED_PULL_REQUESTS = "reviewedPullRequests",
	APPROVED_PULL_REQUESTS = "approvedPullRequests",
}

export function PullsTabs() {
	const searchParams = useSearchParams();
	const tabQuery = (searchParams.get("tab") ||
		TabKey.MY_PULL_REQUESTS) as TabKey;
	const { data } = useAuthStore();
	const { get } = usePullsVisibleLabelsStore();
	const queryClient = useQueryClient();
	const getAuthData = () => {
		if (!data) {
			throw new Error("Auth data is required");
		}
		return data;
	};

	const { data: activePulls } = useQuery({
		queryKey: buildPullsQueryKey(tabQuery, data?.user.login),
		queryFn: () => {
			const authData = getAuthData();
			return queryPullsByTab(tabQuery, authData.token, authData.user.login);
		},
		enabled: !!data,
	});

	const getPullsDataByTab = (targetTab: TabKey) => {
		if (targetTab === tabQuery) {
			return activePulls;
		}

		return queryClient.getQueryData<
			Awaited<ReturnType<typeof queryPullsByTab>>
		>(buildPullsQueryKey(targetTab, data?.user.login));
	};

	const tabs: Tab[] = [
		{
			key: TabKey.MY_PULL_REQUESTS,
			name: "My",
			href: `/pulls?tab=${TabKey.MY_PULL_REQUESTS}`,
			count: filterVisibleLabels(
				getPullsDataByTab(TabKey.MY_PULL_REQUESTS)?.items,
				get(TabKey.MY_PULL_REQUESTS),
			).length,
		},
		{
			key: TabKey.REQUESTED_PULL_REQUESTS,
			name: "Requested",
			href: `/pulls?tab=${TabKey.REQUESTED_PULL_REQUESTS}`,
			count: filterVisibleLabels(
				getPullsDataByTab(TabKey.REQUESTED_PULL_REQUESTS)?.items,
				get(TabKey.REQUESTED_PULL_REQUESTS),
			).length,
		},
		{
			key: TabKey.REVIEWED_PULL_REQUESTS,
			name: "Reviewed",
			href: `/pulls?tab=${TabKey.REVIEWED_PULL_REQUESTS}`,
			count: filterVisibleLabels(
				getPullsDataByTab(TabKey.REVIEWED_PULL_REQUESTS)?.items,
				get(TabKey.REVIEWED_PULL_REQUESTS),
			).length,
		},
		{
			key: TabKey.APPROVED_PULL_REQUESTS,
			name: "Approved",
			href: `/pulls?tab=${TabKey.APPROVED_PULL_REQUESTS}`,
			count: filterVisibleLabels(
				getPullsDataByTab(TabKey.APPROVED_PULL_REQUESTS)?.items,
				get(TabKey.APPROVED_PULL_REQUESTS),
			).length,
		},
	];
	const requestedPullsCount = tabs[1].count;

	useEffect(() => {
		const trayIconName =
			requestedPullsCount > 0 ? "tray-icon-active.png" : "tray-icon.png";
		ipcHandler.setTrayIcon(trayIconName);
	}, [requestedPullsCount]);

	return <Tabs data={tabs} activeTab={tabQuery} />;
}

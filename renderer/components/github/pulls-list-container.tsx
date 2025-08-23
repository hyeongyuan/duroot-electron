import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { isAuthorizedError } from "../../apis/github";
import { queryApprovedPullRequests, queryMyPullRequests, queryRequestedPullRequests, queryReviewedPullRequests } from "../../queries/github";
import { useAuthStore } from "../../stores/auth";
import { usePullsHideLabelsStore } from "../../stores/pulls";
import { ipcHandler } from "../../utils/ipc";
import { Spinner } from "../common/spinner";
import { TABS_HEIGHT } from "../common/tabs";
import { HEADER_HEIGHT } from "../header";
import { LastUpdateTimer } from "./last-update-timer";
import { PullsList } from "./pulls-list";
import { TabKey } from "./pulls-tabs";

const WINDOW_HEIGHT = 500;
const HEADER_SECTION_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

export function PullsListContainer() {
  const searchParams = useSearchParams();
	const router = useRouter();
	const tabQuery = (searchParams.get("tab") || TabKey.MY_PULL_REQUESTS) as TabKey;
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
					return queryMyPullRequests(data?.token ?? '');
				case TabKey.REQUESTED_PULL_REQUESTS:
					return queryRequestedPullRequests(data?.token ?? '');
				case TabKey.REVIEWED_PULL_REQUESTS:
					return queryReviewedPullRequests(data?.token ?? '', data?.user.login);
				case TabKey.APPROVED_PULL_REQUESTS:
					return queryApprovedPullRequests(data?.token ?? '', data?.user.login);
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
  
  return (
    <div
      style={{ height: `${WINDOW_HEIGHT - HEADER_SECTION_HEIGHT}px` }}
      className="overflow-y-auto"
    >
      <div className="py-2">
        <LastUpdateTimer lastUpdatedAt={pulls?.lastUpdatedAt ?? new Date()} />
      </div>
      <PullsList
        pulls={pulls?.items}
        hideLabels={hideLabels}
        tabQuery={tabQuery}
        onClickReload={refetch}
        onChangeLabelFilter={onChangeLabelFilter}
      />
      <Spinner show={isLoading || isRefetching} />
    </div>
  );
}

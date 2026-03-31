import { ArrowPathIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { isAuthorizedError } from '../../apis/github';
import { useExitingItems } from '../../hooks/use-exiting-items';
import { buildPullsQueryKey, queryPullsByTab } from '../../queries/github';
import { useAuthStore } from '../../stores/auth';
import { filterVisibleLabels, usePullsVisibleLabelsStore } from '../../stores/pulls';
import type { GithubIssueItem } from '../../types/github';
import { clearAuthSession } from '../../utils/auth';
import { ipcHandler } from '../../utils/ipc';
import { IconButton } from '../common/icon-button';
import { TABS_HEIGHT } from "../common/tabs";
import { HEADER_HEIGHT } from "../header";
import { Empty } from './empty';
import { ChipsFilter } from './chips-filter';
import { LastUpdateTimer } from './last-update-timer';
import { MyPullsItem } from './my-pulls-item';
import { PullsItem } from './pulls-item';
import { PullsListSkeleton } from './pulls-list-skeleton';
import { TabKey } from './pulls-tabs';

const WINDOW_HEIGHT = 500;
const HEADER_SECTION_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

const isPullVisible = (pull: GithubIssueItem, visibleLabels: string[]) => {
  if (visibleLabels.length === 0) {
    return true;
  }
  return pull.labels.some(label => visibleLabels.includes(label.name));
};

export function PullsList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabQuery = (searchParams.get('tab') || TabKey.MY_PULL_REQUESTS)as TabKey;
  const { data } = useAuthStore();
  const { get, set } = usePullsVisibleLabelsStore();
  const visibleLabels = get(tabQuery);

  const { data: pulls, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: buildPullsQueryKey(tabQuery, data?.user.login),
    queryFn: () => queryPullsByTab(tabQuery, data!.token, data!.user.login),
    enabled: !!data,
  });

  useEffect(() => {
    if (isAuthorizedError(error)) {
      clearAuthSession(useAuthStore.getState().setData)
        .then(() => {
          router.replace('/auth');
        });
    }
  }, [error, router]);

  const renderedPulls = useExitingItems({
    items: pulls?.items,
    scopeKey: tabQuery,
    getItemKey: (pull) => pull.id,
  });


  const onChangeLabelFilter = (chip: { name: string; checked: boolean }) => {
    const newVisibleLabels = chip.checked
      ? [...visibleLabels, chip.name]
      : visibleLabels.filter(item => item !== chip.name);

    set(tabQuery, newVisibleLabels);
  };

  const onResetLabelFilter = () => {
    set(tabQuery, []);
  };

  const uniqueLabels = pulls?.items
    .flatMap(pull => pull.labels.map(label => label.name))
    .filter((label, index, self) => self.indexOf(label) === index) || [];
  const chipFilters = uniqueLabels.map(label => ({
    name: label,
    checked: visibleLabels.includes(label),
  }));
  const filteredPulls = filterVisibleLabels(pulls?.items, visibleLabels);
  const visibleRenderedPulls = renderedPulls.filter(entry => isPullVisible(entry.item, visibleLabels));

  const handleClickOpenAll = () => {
    const urls = filteredPulls.map(item => item.html_url);
    urls.forEach(url => ipcHandler.openExternal(url));
  };

  const showInitialLoading = isLoading && !pulls;
  const showNoData = !!pulls && pulls.items.length === 0 && visibleRenderedPulls.length === 0;
  const showFilteredEmpty = !!pulls && pulls.items.length > 0 && filteredPulls.length === 0 && visibleRenderedPulls.length === 0;

  return (
    <div style={{ height: `${WINDOW_HEIGHT - HEADER_SECTION_HEIGHT}px` }} className="overflow-y-auto">
      <div className="py-2">
        <LastUpdateTimer lastUpdatedAt={pulls?.lastUpdatedAt} />
      </div>
      <div className="flex items-center justify-between px-4 h-[26px]">
        <div className="flex space-x-2">
          <IconButton onClick={handleClickOpenAll} tooltip='Open all'>
            <ArrowTopRightOnSquareIcon className="size-4" />
          </IconButton>
          <IconButton onClick={refetch} tooltip='Refresh tab'>
            <ArrowPathIcon className={`size-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </IconButton>
        </div>
        {isRefetching ? (
          <p className="text-[10px] text-[#768390]" aria-live="polite">
            Refreshing...
          </p>
        ) : null}
      </div>
      {!showInitialLoading ? (
        <div className="mt-3">
          <ChipsFilter
            data={chipFilters}
            onChange={onChangeLabelFilter}
            onReset={onResetLabelFilter}
          />
        </div>
      ) : null}
      {showInitialLoading ? <PullsListSkeleton /> : null}
      {showNoData ? (
        <Empty
          title="No pull requests"
          description="There are no pull requests to show in this tab yet."
        />
      ) : null}
      {showFilteredEmpty ? (
        <Empty
          title="No pull requests match this filter"
          description="Try removing one or more chips to see more pull requests."
          actionLabel="Clear filters"
          onAction={onResetLabelFilter}
        />
      ) : null}
      {!showInitialLoading && !showNoData && !showFilteredEmpty ? (
        <ul className="divide-y divide-[#373e47]" aria-busy={isRefetching}>
          {visibleRenderedPulls.map((entry) => {
            const { item: pull, isExiting } = entry;
            const [repo, owner] = pull.repository_url.split('/').reverse();
            const ownerRepo = `${owner}/${repo}`;
            const labels = pull.draft
              ? [{ name: ' Draft', color: 'cdd9e5' }]
              : pull.labels.map(label => ({ name: label.name, color: label.color }));

            if (tabQuery === TabKey.MY_PULL_REQUESTS) {
              return (
                <MyPullsItem
                  key={entry.key}
                  title={pull.title}
                  titleUrl={pull.html_url}
                  subtitle={ownerRepo}
                  subtitleUrl={`https://github.com/${ownerRepo}`}
                  labels={labels}
                  caption={formatDistanceToNow(new Date(pull.created_at))}
                  pullRequestUrl={pull.pull_request.url}
                  draft={pull.draft}
                  isExiting={isExiting}
                />
              );
            }
            return (
              <PullsItem
                key={entry.key}
                title={pull.title}
                titleUrl={pull.html_url}
                subtitle={ownerRepo}
                subtitleUrl={`https://github.com/${ownerRepo}`}
                pullRequestUrl={pull.pull_request.url}
                labels={labels}
                user={{
                  id: pull.user.id,
                  login: pull.user.login,
                }}
                createdAt={pull.created_at}
                isExiting={isExiting}
              />
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

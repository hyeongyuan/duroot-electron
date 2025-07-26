import { useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns/format';
import { HEADER_HEIGHT } from "../header";
import { TABS_HEIGHT } from "../common/tabs";
import { useAuthStore } from '../../stores/auth';
import { TabKey } from './pulls-tabs';
import { queryApprovedPullRequests, queryMyPullRequests, queryRequestedPullRequests, queryReviewedPullRequests } from '../../queries/github';
import { Empty } from './empty';
import { RoundButton } from '../common/round-button';
import { formatDistanceToNow } from 'date-fns';
import { PullsItem } from './pulls-item';
import { MyPullsItem } from './my-pulls-item';
import { Spinner } from '../common/spinner';
import { ipcHandler } from '../../utils/ipc';

const WINDOW_HEIGHT = 500;
const HEADER_SECTION_HEIGHT = HEADER_HEIGHT + TABS_HEIGHT;

export function PullsList() {
  const searchParams = useSearchParams();
  const tabQuery = (searchParams.get('tab') || TabKey.MY_PULL_REQUESTS)as TabKey;
  const { data } = useAuthStore();

  const { data: pulls, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['pulls', tabQuery],
    queryFn: async () => {
      switch(tabQuery) {
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

  const renderList = useCallback(() => {
    if (!pulls) {
      return null;
    }
    if (pulls.items.length === 0) {
      return <Empty />;
    }
    const handleClickOpenAll = () => {
      if (!pulls) {
        return;
      }
      const urls = pulls.items.map(item => item.html_url);
      urls.forEach(url => ipcHandler.openExternal(url));
    };
    return (
      <>
        <div className="flex px-4 space-x-2">
          <RoundButton onClick={() => refetch()} label="Reload"  />
          <RoundButton onClick={handleClickOpenAll} label="Open all"  />
        </div>
        <ul className="divide-y divide-[#373e47]">
          {pulls.items.map((pull => {
            const [repo, owner] = pull.repository_url.split('/').reverse();
            const ownerRepo = `${owner}/${repo}`;
            const labels = pull.draft
              ? [{ name: ' Draft', color: 'cdd9e5' }]
              : pull.labels.map(label => ({ name: label.name, color: label.color }));

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
          }))}
        </ul>
      </>
    )
  }, [pulls, refetch]);

  return (
    <div style={{ height: `${WINDOW_HEIGHT - HEADER_SECTION_HEIGHT}px` }} className="overflow-y-auto">
      <div className="py-2">
        <p className="text-[#768390] text-[10px] text-center">
          {`Last Update ${format(pulls?.lastUpdatedAt || new Date(), 'HH\'h\' mm\'m\' ss\'s\'')}`}
        </p>
      </div>
      {renderList()}
      <Spinner show={isLoading || isRefetching} />
    </div>
  )
}
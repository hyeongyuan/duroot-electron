
import { useSearchParams } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';

import { type Tab, Tabs } from '../common/tabs';
import { useAuthStore } from '../../stores/auth';
import { queryApprovedPullRequests, queryMyPullRequests, queryRequestedPullRequests, queryReviewedPullRequests } from '../../queries/github';

export enum TabKey {
  MY_PULL_REQUESTS = 'myPullRequests',
  REQUESTED_PULL_REQUESTS = 'requestedPullRequests',
  REVIEWED_PULL_REQUESTS = 'reviewedPullRequests',
  APPROVED_PULL_REQUESTS = 'approvedPullRequests',
}

export function  PullsTabs() {
  const searchParams = useSearchParams();
  const tabQuery = (searchParams.get('tab') || TabKey.MY_PULL_REQUESTS)as TabKey;
  const { data } = useAuthStore();

  const [myPulls, requestedPulls, reviewedPulls, approvedPulls] = useQueries({ queries: [
    {
      queryKey: ['pulls', TabKey.MY_PULL_REQUESTS],
      queryFn: () => queryMyPullRequests(data.token!),
      enabled: !!data,
    },
    {
      queryKey: ['pulls', TabKey.REQUESTED_PULL_REQUESTS],
      queryFn: () => queryRequestedPullRequests(data.token!),
      enabled: !!data,
    },
    {
      queryKey: ['pulls', TabKey.REVIEWED_PULL_REQUESTS],
      queryFn: () => queryReviewedPullRequests(data.token!, data.user.login!),
      enabled: !!data,
    },
    {
      queryKey: ['pulls', TabKey.APPROVED_PULL_REQUESTS],
      queryFn: () => queryApprovedPullRequests(data.token!, data.user.login!),
      enabled: !!data,
    },
  ] });

  const tabs: Tab[] = [
    {
      key: TabKey.MY_PULL_REQUESTS,
      name: 'My',
      href: `/pulls?tab=${TabKey.MY_PULL_REQUESTS}`,
      count: myPulls.data?.items.length,
    },
    {
      key: TabKey.REQUESTED_PULL_REQUESTS,
      name: 'Requested',
      href: `/pulls?tab=${TabKey.REQUESTED_PULL_REQUESTS}`,
      count: requestedPulls.data?.items.length,
    },
    {
      key: TabKey.REVIEWED_PULL_REQUESTS,
      name: 'Reviewed',
      href: `/pulls?tab=${TabKey.REVIEWED_PULL_REQUESTS}`,
      count: reviewedPulls.data?.items.length,
    },
    {
      key: TabKey.APPROVED_PULL_REQUESTS,
      name: 'Approved',
      href: `/pulls?tab=${TabKey.APPROVED_PULL_REQUESTS}`,
      count: approvedPulls.data?.items.length,
    }
  ];

  return <Tabs data={tabs} activeTab={tabQuery} />;
}

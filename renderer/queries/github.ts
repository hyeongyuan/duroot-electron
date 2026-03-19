import { fetchApprovedPullRequests, fetchPullRequestsBy, fetchRequestedPullRequests, fetchReviewedPullRequests } from "../apis/github";

export const queryMyPullRequests = async (token: string) => {
  const { items }= await fetchPullRequestsBy(token);
  return {
    items,
    lastUpdatedAt: new Date(),
  };
};

export const queryRequestedPullRequests = async (token: string) => {
  const { items } = await fetchRequestedPullRequests(token);
  return {
    items,
    lastUpdatedAt: new Date(),
  };
};

export const queryReviewedPullRequests = async (token: string, login?: string) => {
  const { items } = await fetchReviewedPullRequests(token, login);
  return {
    items,
    lastUpdatedAt: new Date(),
  };
};

export const queryApprovedPullRequests = async (token: string, login?: string) => {
  const { items } = await fetchApprovedPullRequests(token, login);
  return {
    items,
    lastUpdatedAt: new Date(),
  };
};

export const buildPullsQueryKey = (tabKey: string, login?: string) => ['pulls', login || 'anonymous', tabKey] as const;

export const queryPullsByTab = (tabKey: string, token: string, login?: string) => {
  switch (tabKey) {
    case 'myPullRequests':
      return queryMyPullRequests(token);
    case 'requestedPullRequests':
      return queryRequestedPullRequests(token);
    case 'reviewedPullRequests':
      return queryReviewedPullRequests(token, login);
    case 'approvedPullRequests':
      return queryApprovedPullRequests(token, login);
    default:
      return queryMyPullRequests(token);
  }
};

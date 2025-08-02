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
    items: items.filter(item => !item.draft),
    lastUpdatedAt: new Date(),
  };
};

export const queryReviewedPullRequests = async (token: string, login?: string) => {
  const { items } = await fetchReviewedPullRequests(token, login);
  return {
    items: items.filter(item => !item.draft),
    lastUpdatedAt: new Date(),
  };
};

export const queryApprovedPullRequests = async (token: string, login?: string) => {
  const { items } = await fetchApprovedPullRequests(token, login);
  return {
    items: items.filter(item => !item.draft),
    lastUpdatedAt: new Date(),
  };
};

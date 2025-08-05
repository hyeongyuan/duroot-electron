import axios, { AxiosError } from 'axios';
import type { GithubPull, GithubReview, GithubSearch, GithubUser } from '../types/github';

const SELF = '@me';

const instance = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
  },
});

export const fetchUser = async (token: string) => {
  const { data } = await instance.get<GithubUser>('/user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const searchIssues = async (token: string, query: string) => {
  const { data } = await instance.get<GithubSearch>(`/search/issues?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const fetchPullRequest = async (token: string, pullRequestUrl: string) => {
  const { data } = await instance.get<GithubPull>(pullRequestUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const fetchPullRequestsBy = (token: string, author = SELF) => {
  const query = `type:pr state:open author:${author}`;
  return searchIssues(token, query);
};

export const fetchRequestedPullRequests = async (token: string, login = SELF) => {
  const query = `type:pr state:open draft:false user-review-requested:${login}`;
  return searchIssues(token, query);
};

const fetchPullRequestReviews = async (token: string, pullRequestUrl: string) => {
  const { data } = await instance.get<GithubReview[]>(`${pullRequestUrl}/reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const fetchReviewedPullRequests = async (token: string, login = SELF) => {
  const query = `type:pr state:open draft:false reviewed-by:${login} -author:${login} -review:approved`;
  return searchIssues(token, query);
};

export const fetchApprovedPullRequests = (token: string, login = SELF) => {
  const query = `type:pr state:open draft:false reviewed-by:${login} -author:${login} review:approved`;
  return searchIssues(token, query);
};

export const fetchReviewCount = async (token: string, pullRequestUrl: string, login: string) => {
  const [pullRequest, reviews] = await Promise.all([
    fetchPullRequest(token, pullRequestUrl),
    fetchPullRequestReviews(token, pullRequestUrl),
  ]);

  const approvedUsers = [];
  const totalUsers = [];

  reviews.forEach(review => {
    if (review.user.login === login || review.user.type === 'Bot') {
      return;
    }
    if (review.state === 'APPROVED' && pullRequest.requested_reviewers.every(reviewer => reviewer.login !== review.user.login)) {
      approvedUsers.push(review.user.login);
    }
    totalUsers.push(review.user.login);
  });
  pullRequest.requested_reviewers.forEach(reviewer => {
    totalUsers.push(reviewer.login);
  });

  return {
    approved: Array.from(new Set(approvedUsers)).length,
    total: Array.from(new Set(totalUsers)).length,
  };
};

export const isAuthorizedError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

import axios from 'axios';
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
  const query = `type:pr state:open user-review-requested:${login}`;
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
  const query = `type:pr state:open reviewed-by:${login}`;
  const { items: issueItems } = await searchIssues(token, query);

  const exceptByLogin = issueItems.filter(item => item.user.login !== login);
  const approvedChecks = await Promise.all(
    exceptByLogin.map(item => fetchPullRequestReviews(token, item.pull_request.url)
      .then(reviews => (
        reviews.some(review => review.state === 'APPROVED' && review.user.login === login)
      )))
  );

  return {
    approvedItems: exceptByLogin.filter((_, i) => approvedChecks[i]),
    reviewedItems: exceptByLogin.filter((_, i) => !approvedChecks[i]),
  };
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

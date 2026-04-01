import axios, {
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";
import type {
	GithubPull,
	GithubReview,
	GithubSearch,
	GithubUser,
} from "../types/github";

const SELF = "@me";

const instance = axios.create({
	baseURL: "https://api.github.com",
	headers: {
		Accept: "application/vnd.github+json",
	},
});

interface GithubRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
	ignoreForbiddenError?: boolean;
}

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (
			isForbiddenError(error) &&
			(error.config as GithubRequestConfig | undefined)?.ignoreForbiddenError
		) {
			return {
				...(error.response as AxiosResponse),
				data: undefined,
				config: error.config,
			};
		}

		return Promise.reject(error);
	},
);

const githubGet = async <T>(
	url: string,
	token: string,
	config?: GithubRequestConfig,
) => {
	const { data } = await instance.get<T | undefined>(url, {
		...config,
		headers: {
			Authorization: `Bearer ${token}`,
			...config?.headers,
		},
	});

	return data;
};

export const fetchUser = async (token: string) => {
	const user = await githubGet<GithubUser>("/user", token, {
		ignoreForbiddenError: false,
	});
	return user;
};

const searchIssues = async (token: string, query: string) => {
	return githubGet<GithubSearch>(
		`/search/issues?q=${encodeURIComponent(query)}`,
		token,
		{ ignoreForbiddenError: true },
	);
};

const fetchPullRequest = async (token: string, pullRequestUrl: string) => {
	return githubGet<GithubPull>(pullRequestUrl, token, {
		ignoreForbiddenError: true,
	});
};

export const fetchPullRequestChanges = async (
	token: string,
	pullRequestUrl: string,
) => {
	const pullRequest = await fetchPullRequest(token, pullRequestUrl);
	if (!pullRequest) {
		return undefined;
	}

	return {
		additions: pullRequest.additions,
		deletions: pullRequest.deletions,
		changedFiles: pullRequest.changed_files,
	};
};

const getReviewCount = (
	pullRequest: GithubPull,
	reviews: GithubReview[],
	login: string,
) => {
	const approvedUsers = [];
	const totalUsers = [];

	for (const review of reviews) {
		if (review.user.login === login || review.user.type === "Bot") {
			continue;
		}
		if (
			review.state === "APPROVED" &&
			pullRequest.requested_reviewers.every(
				(reviewer) => reviewer.login !== review.user.login,
			)
		) {
			approvedUsers.push(review.user.login);
		}
		totalUsers.push(review.user.login);
	}
	for (const reviewer of pullRequest.requested_reviewers) {
		totalUsers.push(reviewer.login);
	}

	return {
		approved: Array.from(new Set(approvedUsers)).length,
		total: Array.from(new Set(totalUsers)).length,
	};
};

export const fetchPullRequestsBy = (token: string, author = SELF) => {
	const query = `type:pr state:open author:${author}`;
	return searchIssues(token, query);
};

export const fetchRequestedPullRequests = async (
	token: string,
	login = SELF,
) => {
	const query = `type:pr state:open draft:false user-review-requested:${login}`;
	return searchIssues(token, query);
};

const fetchPullRequestReviews = async (
	token: string,
	pullRequestUrl: string,
) => {
	return githubGet<GithubReview[]>(`${pullRequestUrl}/reviews`, token, {
		ignoreForbiddenError: true,
	});
};

export const fetchReviewedPullRequests = async (
	token: string,
	login = SELF,
) => {
	const query = `type:pr state:open draft:false reviewed-by:${login} -author:${login} -review:approved`;
	return searchIssues(token, query);
};

export const fetchApprovedPullRequests = (token: string, login = SELF) => {
	const query = `type:pr state:open draft:false reviewed-by:${login} -author:${login} review:approved`;
	return searchIssues(token, query);
};

export const fetchReviewCount = async (
	token: string,
	pullRequestUrl: string,
	login: string,
) => {
	const [pullRequest, reviews] = await Promise.all([
		fetchPullRequest(token, pullRequestUrl),
		fetchPullRequestReviews(token, pullRequestUrl),
	]);
	if (!pullRequest || !reviews) {
		return undefined;
	}

	return getReviewCount(pullRequest, reviews, login);
};

export const fetchMyPullRequestMeta = async (
	token: string,
	pullRequestUrl: string,
	login: string,
) => {
	const [pullRequest, reviews] = await Promise.all([
		fetchPullRequest(token, pullRequestUrl),
		fetchPullRequestReviews(token, pullRequestUrl),
	]);
	if (!pullRequest || !reviews) {
		return undefined;
	}

	return {
		reviewCount: getReviewCount(pullRequest, reviews, login),
		changes: {
			additions: pullRequest.additions,
			deletions: pullRequest.deletions,
			changedFiles: pullRequest.changed_files,
		},
	};
};

export const isAuthorizedError = (error: unknown): error is AxiosError => {
	return axios.isAxiosError(error) && error.response?.status === 401;
};

export const isForbiddenError = (error: unknown): error is AxiosError => {
	return axios.isAxiosError(error) && error.response?.status === 403;
};

export const isNetworkError = (error: unknown): error is AxiosError => {
	if (!axios.isAxiosError(error)) {
		return false;
	}

	return (
		!error.response ||
		error.code === "ERR_NETWORK" ||
		error.code === "ECONNABORTED"
	);
};

import { create } from "zustand";
import type { GithubIssueItem } from "../types/github";
import { ipcHandler } from "../utils/ipc";

const KEY = "pulls.labels.visibleByTab";

export type VisibleLabelsByTab = Record<string, string[]>;

interface PullsVisibleLabelsState {
	data: VisibleLabelsByTab;
	init: () => Promise<void>;
	get: (tabKey: string) => string[];
	set: (tabKey: string, labels: string[]) => Promise<void>;
}

const isVisibleLabelsByTab = (value: unknown): value is VisibleLabelsByTab => {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	return Object.values(value).every(
		(labels) =>
			Array.isArray(labels) &&
			labels.every((label) => typeof label === "string"),
	);
};

export const usePullsVisibleLabelsStore = create<PullsVisibleLabelsState>(
	(set, get) => ({
		data: {},
		init: async () => {
			const storedData = await ipcHandler.getStorage(KEY);
			if (!isVisibleLabelsByTab(storedData)) {
				return;
			}
			set({ data: storedData });
		},
		get: (tabKey) => get().data[tabKey] || [],
		set: async (tabKey, labels) => {
			const newData = {
				...get().data,
				[tabKey]: labels,
			};

			await ipcHandler.setStorage(KEY, newData);
			set({ data: newData });
		},
	}),
);

export const filterVisibleLabels = (
	items: GithubIssueItem[] = [],
	visibleLabels: string[],
) => {
	if (visibleLabels.length === 0) {
		return items;
	}

	return items.filter((item) =>
		item.labels.some((label) => visibleLabels.includes(label.name)),
	);
};

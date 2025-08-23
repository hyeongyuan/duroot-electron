import { create } from "zustand";
import type { GithubIssueItem } from "../types/github";
import { ipcHandler } from "../utils/ipc";

const KEY = "pulls.labels.hide";

interface PullsHideLabelsState {
	data: string[];
	init: () => Promise<void>;
	set: (data: string[]) => Promise<void>;
}

export const usePullsHideLabelsStore = create<PullsHideLabelsState>((set) => ({
	data: [],
	init: async () => {
		const storedData = await ipcHandler.getStorage<string[]>(KEY);
		if (!storedData) {
			return;
		}
		set({ data: storedData });
	},
	set: async (data) => {
		await ipcHandler.setStorage(KEY, data);
		set({ data });
	},
}));

export const filterHideLabels = (
	items: GithubIssueItem[],
	hideLabels: string[],
) => {
	return (
		items.filter((item) =>
			item.labels.every((label) => !hideLabels.includes(label.name)),
		)
	);
};

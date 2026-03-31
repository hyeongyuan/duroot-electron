import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const SECOND = 1000;

interface LastUpdateTimerProps {
	lastUpdatedAt?: Date;
	loadingLabel?: string;
}

export function LastUpdateTimer({
	lastUpdatedAt,
	loadingLabel = "Not loaded yet",
}: LastUpdateTimerProps) {
	const [, setCount] = useState(0);

	useEffect(() => {
		if (!lastUpdatedAt) {
			return;
		}

		const interval = setInterval(() => {
			setCount((prevCount) => prevCount + 1);
		}, SECOND);
		return () => clearInterval(interval);
	}, [lastUpdatedAt]);

	if (!lastUpdatedAt) {
		return (
			<p className="text-[#768390] text-[10px] text-center">{loadingLabel}</p>
		);
	}

	return (
		<p className="text-[#768390] text-[10px] text-center">
			{`Last update ${formatDistanceToNow(lastUpdatedAt)} ago`}
		</p>
	);
}

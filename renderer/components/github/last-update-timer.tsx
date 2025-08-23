import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

const SECOND = 1000;

interface LastUpdateTimerProps {
	lastUpdatedAt: Date;
}

export function LastUpdateTimer({ lastUpdatedAt }: LastUpdateTimerProps) {
	const [, setCount] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCount((prevCount) => prevCount + 1);
		}, SECOND);
		return () => clearInterval(interval);
	}, []);

	return (
		<p className="text-center text-[#768390] text-[10px]">
			{`Last update ${formatDistanceToNow(lastUpdatedAt)} ago`}
		</p>
	);
}

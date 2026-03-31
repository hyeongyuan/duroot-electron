import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions {
	threshold?: number;
	rootMargin?: string;
	triggerOnce?: boolean;
}

export const useIntersectionObserver = <T extends HTMLElement>(
	options?: UseIntersectionObserverOptions,
) => {
	const {
		threshold = 0,
		rootMargin = "0px",
		triggerOnce = true,
	} = options || {};
	const [isIntersecting, setIsIntersecting] = useState(false);
	const [hasIntersected, setHasIntersected] = useState(false);
	const targetRef = useRef<T>(null);

	useEffect(() => {
		const target = targetRef.current;
		if (!target) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const isIntersectingNow = entry.isIntersecting;
					setIsIntersecting(isIntersectingNow);

					if (isIntersectingNow && !hasIntersected) {
						setHasIntersected(true);
						if (triggerOnce) {
							observer.unobserve(target);
						}
					}
				}
			},
			{ threshold, rootMargin },
		);

		observer.observe(target);

		return () => {
			observer.unobserve(target);
		};
	}, [threshold, rootMargin, triggerOnce, hasIntersected]);

	return {
		targetRef,
		isIntersecting,
		hasIntersected,
	};
};

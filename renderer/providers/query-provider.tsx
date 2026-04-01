import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { isAuthorizedError, isForbiddenError } from "../apis/github";

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry(failureCount, error) {
							if (isAuthorizedError(error) || isForbiddenError(error)) {
								return false;
							}
							return failureCount < 3;
						},
					},
				},
			}),
	);
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

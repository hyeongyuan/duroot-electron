import { PullsListContainer } from "../components/github/pulls-list-container";
import { PullsTabs } from "../components/github/pulls-tabs";
import { Header } from "../components/header";
import { withAuth } from "../hocs/with-auth";

function PullsPage() {
	return (
		<div className="w-full">
			<Header />
			<PullsTabs />
			<PullsListContainer />
		</div>
	);
}

export default withAuth(PullsPage);

import { PullsList } from "../components/github/pulls-list";
import { PullsTabs } from "../components/github/pulls-tabs";
import { Header } from "../components/header";
import { withAuth } from "../hocs/with-auth";

function PullsPage() {
	return (
		<div className="w-full">
			<Header />
			<PullsTabs />
			<PullsList />
		</div>
	);
}

export default withAuth(PullsPage);

import { Header } from '../components/header';
import { PullsTabs } from '../components/github/pulls-tabs';
import { PullsList } from '../components/github/pulls-list';
import { withAuth } from '../hocs/with-auth';

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

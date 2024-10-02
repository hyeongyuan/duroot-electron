import { Header } from '../components/header';
import { PullsTabs } from '../components/github/pulls-tabs';
import { withAuth } from '../hocs/with-auth';

function PullsPage() {
  return (
    <div className="w-full">
      <Header />
      <PullsTabs />
    </div>
  );
}

export default withAuth(PullsPage);

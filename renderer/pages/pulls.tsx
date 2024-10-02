import { Header } from '../components/header';
import { withAuth } from '../hocs/with-auth';

function PullsPage() {
  return (
    <div className="w-full">
      <Header />
    </div>
  );
}

export default withAuth(PullsPage);

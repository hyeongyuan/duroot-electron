import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { useQuery } from '@tanstack/react-query';
import { fetchPullRequestChanges } from '../../apis/github';
import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import { useAuthStore } from '../../stores/auth';
import { Label } from '../common/label';
import { Anchor } from '../common/anchor';
import { PullChanges } from './pull-changes';

const getProfileUrl = (userId: number, size = 40) => `https://avatars.githubusercontent.com/u/${userId}?s=${size}&v=4`;

interface PullsItemProps {
  title: string;
  titleUrl: string;
  subtitle: string;
  subtitleUrl: string;
  pullRequestUrl: string;
  labels: {
    name: string;
    color: string;
  }[];
  user: {
    id: number;
    login: string;
  };
  createdAt: string;
}

export function PullsItem({ title, titleUrl, subtitle, subtitleUrl, pullRequestUrl, labels, user, createdAt }: PullsItemProps) {
  const { data } = useAuthStore();
  const { targetRef, hasIntersected } = useIntersectionObserver<HTMLLIElement>({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  const { data: changes } = useQuery({
    queryKey: ['pull-changes', pullRequestUrl],
    queryFn: () => fetchPullRequestChanges(data.token, pullRequestUrl),
    enabled: !!data && hasIntersected,
  });

  return (
    <li ref={targetRef} className="flex flex-col px-4 py-2">
      <div className="flex items-center">
        <Anchor
          className="text-[#768390] text-xs leading-5 line-clamp-1 break-all hover:underline hover:underline-offset-1 pr-1"
          href={subtitleUrl}
          target="_blank"
        >
          {subtitle}
        </Anchor>
      </div>
      <div className={labels.length > 0 ? 'mb-1' : ''}>
        <Anchor
          className="font-medium text-sm hover:text-[#539bf5] leading-6 line-clamp-3 break-all"
          href={titleUrl}
          target="_blank"
        >
          {title}
        </Anchor>
      </div>
      <span className={`${labels.length > 0 ? 'mb-1' : ''} flex flex-wrap space-x-1 gap-1`}> 
        {labels.map(({ name, color }) => (
          <Label key={name} name={name} color={color} />
        ))}
      </span>
      <div className="flex items-center justify-between gap-2 text-[#768390]">
        <div className="flex min-w-0 items-center">
          <span className="flex min-w-0 items-center">
            <img className="w-4 h-4 rounded-full mr-2" src={getProfileUrl(user.id, 32)} alt="avatar" />
            <p className="text-[#adbac7] text-[10px] font-medium leading-5 line-clamp-1 break-all">
              {user.login}
            </p>
          </span>
          <span className="mx-1">·</span>
          <span>
            <p className="text-[10px] font-medium leading-5 line-clamp-1 break-all">
              {formatDistanceToNow(new Date(createdAt))}
            </p>
          </span>
        </div>
        {changes ? <PullChanges additions={changes.additions} deletions={changes.deletions} /> : null}
      </div>
    </li>
  );
}

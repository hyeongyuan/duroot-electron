import { useQuery } from '@tanstack/react-query';
import { fetchMyPullRequestMeta } from '../../apis/github';
import { useIntersectionObserver } from '../../hooks/use-intersection-observer';
import { useAuthStore } from '../../stores/auth';
import { Anchor } from '../common/anchor';
import { ApprovedMark } from '../common/approved-mark';
import { Label } from '../common/label';
import { PullChanges } from './pull-changes';

interface MyPullsItemProps {
  title: string;
  titleUrl: string;
  subtitle: string;
  subtitleUrl: string;
  labels: {
    name: string;
    color: string;
  }[];
  pullRequestUrl: string;
  caption?: string;
  draft?: boolean;
}

export function MyPullsItem({ title, titleUrl, subtitle, subtitleUrl, labels, pullRequestUrl, caption, draft }: MyPullsItemProps) {
  const { data } = useAuthStore();

  const { targetRef, hasIntersected } = useIntersectionObserver<HTMLLIElement>({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  const { data: meta } = useQuery({
    queryKey: ['my-pull-meta', pullRequestUrl, data?.user.login],
    queryFn: () => fetchMyPullRequestMeta(data!.token, pullRequestUrl, data!.user.login),
    enabled: !!data && hasIntersected,
  });

  const reviewCount = meta?.reviewCount;
  const changes = meta?.changes;

  const allApproved = reviewCount && reviewCount.approved === reviewCount.total;

  return (
    <li ref={targetRef} className="flex flex-col px-4 py-2">
      <div className="flex items-center">
        <Anchor
          className="text-[#768390] text-xs leading-5 line-clamp-1 break-all hover:underline hover:underline-offset-1 pr-1"
          href={subtitleUrl}
        >
          {subtitle}
        </Anchor>
        {(!draft && reviewCount) ? (
          allApproved
            ? <ApprovedMark />
            : <p className="text-[#768390] text-xs tracking-wide">
                {`· ${reviewCount.approved}/${reviewCount.total}`}
              </p>
        ) : null}
      </div>
      <div className={labels.length > 0 ? 'mb-1' : ''}>
        <Anchor
          className="font-medium text-sm hover:text-[#539bf5] leading-6 line-clamp-3 break-all"
          href={titleUrl}
        >
          {title}
        </Anchor>
      </div>
      <span className="flex flex-wrap gap-1">
        {labels.map(({ name, color }) => (
          <Label key={name} name={name} color={color} />
        ))}
      </span>
      {(caption || changes) && (
        <div className="mt-1 flex items-center justify-between gap-2 text-[#768390]">
          <p className="min-w-0 text-[10px] leading-5 line-clamp-1 break-all">
            {caption}
          </p>
          {changes ? <PullChanges additions={changes.additions} deletions={changes.deletions} /> : null}
        </div>
      )}
    </li>
  );
}

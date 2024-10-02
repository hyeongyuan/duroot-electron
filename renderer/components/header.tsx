import { useRef } from 'react';
import { usePathname } from 'next/navigation';

import { Avatar } from './common/avatar';
import { useAuthStore } from '../stores/auth';

export const HEADER_HEIGHT = 44;

export function Header() {
  const pathname = usePathname();
  const { data } = useAuthStore();
  
  return (
    <div
      style={{ height: `${HEADER_HEIGHT}px` }}
      className="flex items-center justify-between bg-[#2d333b] border border-[#373e47] px-4"
    >
      <div className="flex gap-4">
        <a href="/pulls">
          <h1 className={`${pathname === '/pulls/' ? 'text-[#e6edf3]' : ''}`}>Pulls</h1>
        </a>
      </div>
      <div className="relative select-none">
        <div className="cursor-pointer">
          <Avatar
            size={24}
            imageUrl={data ? `https://avatars.githubusercontent.com/u/${data.id}?s=40&v=4` : ''}
          />
        </div>
      </div>
    </div>
  );
}

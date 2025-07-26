import type { MouseEvent } from "react";
import { ipcHandler } from "../../utils/ipc";

interface AnchorProps extends React.HTMLProps<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function Anchor({ children, href, ...props }: AnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    ipcHandler.openExternal(href);
  };
  return (
    <a href="#" onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

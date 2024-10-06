import { MouseEvent } from "react";

interface AnchorProps extends React.HTMLProps<HTMLAnchorElement> {
  children: React.ReactNode;
}

export function Anchor({ children, href, ...props }: AnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    window.ipc.openExternal(href);
  };
  return (
    <a href="#" onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

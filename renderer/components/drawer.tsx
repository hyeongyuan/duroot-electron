import Link from "next/link";
import { useAuthStore } from "../stores/auth";
import { Avatar } from "./common/avatar";
import { ipcHandler } from "../utils/ipc";

interface DrawerProps {
  visible: boolean;
  onClose?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function Drawer({ visible, onClose }: DrawerProps) {
  const { data } = useAuthStore();
  
  const handleClickQuit = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    ipcHandler.quit();
  };

  return (
    <div
      style={{
        boxShadow: '0 8px 24px #1c2128',
      }}
      className={`fixed top-0 right-0 z-40 h-screen overflow-y-auto transition-transform w-64 bg-[#2d333b] rounded-l-lg border border-[#444c56] ${visible ? 'transform-none' : 'translate-x-full'}`}
    >
      <div className="flex items-center pt-4 px-4">
        <Avatar
          size={32}
          imageUrl={data ? `https://avatars.githubusercontent.com/u/${data.user.id}?s=40&v=4` : ''}
        />
        <div className="flex flex-1">
          <div className="ml-2">
            <h5 style={{ lineHeight: 1.25 }} className="text-sm font-semibold text-[#e6edf3] leading-1">{data?.user.login}</h5>
            <p  style={{ lineHeight: 1.25 }}className="text-sm text-gray-400 leading-1">{data?.user.name}</p>
          </div>
        </div>
        <button
          type="button"
          className="bg-transparent rounded-lg w-8 h-8 inline-flex items-center justify-center hover:bg-[#444c56]"
          onClick={onClose}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="#9198a1">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>
      <div className="p-4 overflow-y-auto">
        <Link href="/settings" className="flex items-center py-1 px-2 hover:bg-[#444c56] rounded">
          <span className="mr-2">
            <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="#9198a1">
              <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z" />
            </svg>
          </span>
          <span className="text-sm text-[#e6edf3]">Settings</span>
        </Link>

        <div className="border-t border-[#444c56] my-[6px]" />

        <a href="#" onClick={handleClickQuit} className="flex items-center py-1 px-2 hover:bg-[#444c56] rounded">
          <span className="mr-2">
            <svg focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="#9198a1">
              <path d="M2 2.75C2 1.784 2.784 1 3.75 1h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0-.25.25v10.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 0 1.5h-2.5A1.75 1.75 0 0 1 2 13.25Zm10.44 4.5-1.97-1.97a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.97-1.97H6.75a.75.75 0 0 1 0-1.5Z"></path>
            </svg>
          </span>
          <span className="text-sm text-[#e6edf3]">Quit</span>
        </a>
      </div>
    </div>
  );
}
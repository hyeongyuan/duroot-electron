import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Anchor } from "../components/common/anchor";
import { SignInButton } from "../components/github/sign-in-button";
import type { GithubAccessToken } from "../types/github";
import { ipcHandler } from "../utils/ipc";


export default function AuthPage() {
  const router = useRouter();
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isAuthorizing && document.visibilityState === "visible") {
        ipcHandler.getStorage<GithubAccessToken>("github.auth").then((data) => {
          if (!data) {
            return;
          }
          router.replace("/home");
        });
      }
    }
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router, isAuthorizing]);
  
  const handleGithubSignIn = async () => {
    setIsAuthorizing(true);

    ipcHandler.githubAuth();
  };

  return (
    <>
      <div className="flex flex-1 justify-center">
        <div className="my-28">
          <div className="mb-24">
            <Image
              src="/images/logo.png"
              alt="Duroot Logo"
              width={240}
              height={80}
              unoptimized
              style={{ margin: "0 auto" }}
            />
          </div>
          <div className="flex">
            <SignInButton isLoading={isAuthorizing} onClick={handleGithubSignIn} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-center text-xs">
          Don"t have a token?{" "}
          <Anchor className="cursor-pointer text-[#4493f8] underline" href="https://github.com/settings/tokens">
            Generate here
          </Anchor>
        </p>
      </div>
    </>
  );
}

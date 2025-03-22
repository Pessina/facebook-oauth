import { useEffect } from "react";
import { handleLoginCallBack } from "../handleLoginCallBack";

export const FacebookAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    const handleUrlChange = () => {
      handleLoginCallBack(new URLSearchParams(window.location.search));
    };

    handleUrlChange();

    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return children;
};

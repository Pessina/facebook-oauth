import { useEffect } from "react";
import { handleLoginCallBack } from "./handleLoginCallBack";

export const FacebookAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    handleLoginCallBack();
  }, []);

  return children;
};

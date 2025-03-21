import { useEffect } from "react";
import { handleLoginCallBack } from "./handleLoginCallBack";

export const FacebookProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    handleLoginCallBack();
  }, []);

  return children;
};

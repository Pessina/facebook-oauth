import { useCallback } from "react";
import {
  FacebookAuthConfig,
  initiateLogin as pureInitiateLogin,
} from "./initiateLogin";

export function useFacebookAuth(config: FacebookAuthConfig) {
  const initiateLogin = useCallback(
    (args?: { nonce?: string }) => pureInitiateLogin({ ...config, ...args }),
    []
  );

  return {
    initiateLogin,
  };
}

import {
  generatePKCEVerifier,
  generatePKCEChallenge,
  safeStorage,
} from "./utils";

export const OAUTH_CONFIG = {
  FACEBOOK_API_VERSION: "v21.0",
  STORAGE_KEYS: {
    CODE_VERIFIER: "codeVerifier",
    STATE: "state",
  },
} as const;

export interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}

export interface FacebookAuthConfig {
  appId: string;
  scope?: string;
  nonce?: string;
  responseType?: "code";
  callbackUri?: string;
  onSuccess?: (idToken?: string) => void;
  onError?: (error: Error) => void;
}

export const initiateLogin = async (config: FacebookAuthConfig) => {
  let popup: Window | null = null;

  const cleanup = () => {
    safeStorage.removeItem(OAUTH_CONFIG.STORAGE_KEYS.CODE_VERIFIER);
    safeStorage.removeItem(OAUTH_CONFIG.STORAGE_KEYS.STATE);
    if (popup && !popup.closed) {
      popup.close();
    }
  };

  try {
    if (!config.appId) {
      throw new Error("Facebook App ID is required");
    }

    const codeVerifier = generatePKCEVerifier();
    const codeChallenge = await generatePKCEChallenge(codeVerifier);
    const state = generatePKCEVerifier();
    const nonce = config?.nonce || generatePKCEVerifier();

    safeStorage.setItem(OAUTH_CONFIG.STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
    safeStorage.setItem(OAUTH_CONFIG.STORAGE_KEYS.STATE, state);

    const redirectUri =
      config.callbackUri ?? window.location.href.split("?")[0];
    const url = new URL(
      `https://www.facebook.com/${OAUTH_CONFIG.FACEBOOK_API_VERSION}/dialog/oauth`
    );

    url.searchParams.append("client_id", config.appId);
    url.searchParams.append("redirect_uri", redirectUri);
    url.searchParams.append("state", state);
    url.searchParams.append("scope", "openid " + (config?.scope || ""));
    url.searchParams.append("response_type", config.responseType || "code");
    url.searchParams.append("code_challenge", codeChallenge);
    url.searchParams.append("code_challenge_method", "S256");
    url.searchParams.append("nonce", nonce);

    const authPromise = new Promise<void>((resolve, reject) => {
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === "FACEBOOK_AUTH_SUCCESS") {
          const { code, returnedState } = event.data;

          try {
            const storedState = safeStorage.getItem(
              OAUTH_CONFIG.STORAGE_KEYS.STATE
            );
            if (!storedState || returnedState !== storedState) {
              throw new Error("State validation failed - possible CSRF attack");
            }

            const storedCodeVerifier = safeStorage.getItem(
              OAUTH_CONFIG.STORAGE_KEYS.CODE_VERIFIER
            );
            if (!storedCodeVerifier) {
              throw new Error("Code verifier not found in browser storage");
            }

            const tokenUrl = new URL(
              `https://graph.facebook.com/${OAUTH_CONFIG.FACEBOOK_API_VERSION}/oauth/access_token`
            );

            const params = new URLSearchParams({
              client_id: config.appId,
              redirect_uri: redirectUri,
              code_verifier: storedCodeVerifier,
              code: code,
            });

            const response = await fetch(
              `${tokenUrl.toString()}?${params.toString()}`,
              {
                method: "GET",
                headers: { Accept: "application/json" },
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                `Failed to fetch access token: ${response.status} ${
                  response.statusText
                }${
                  errorData.error
                    ? ` - ${
                        errorData.error.message || JSON.stringify(errorData)
                      }`
                    : ""
                }`
              );
            }

            const data = (await response.json()) as FacebookTokenResponse;

            if (data.access_token && config.onSuccess) {
              config.onSuccess(data.id_token);
              resolve();
            } else {
              throw new Error("Access token not received from Facebook");
            }
          } catch (error) {
            if (error instanceof Error && config.onError) {
              config.onError(error);
            } else {
              console.error(
                "Unknown error during Facebook authentication:",
                error
              );
              if (config.onError) {
                config.onError(
                  new Error("Unknown error during Facebook authentication")
                );
              }
            }
            reject(error);
          } finally {
            window.removeEventListener("message", messageHandler);
            cleanup();
          }
        } else if (event.data?.type === "FACEBOOK_AUTH_ERROR") {
          const { error } = event.data;
          window.removeEventListener("message", messageHandler);
          cleanup();
          const errorMessage =
            typeof error === "string"
              ? error
              : "Facebook authentication failed";
          const authError = new Error(errorMessage);
          if (config.onError) {
            config.onError(authError);
          }
          reject(authError);
        }
      };

      window.addEventListener("message", messageHandler);

      const width = 600;
      const height = 700;
      const left = Math.max(
        0,
        (window.innerWidth - width) / 2 + window.screenX
      );
      const top = Math.max(
        0,
        (window.innerHeight - height) / 2 + window.screenY
      );

      popup = window.open(
        url.toString(),
        "facebook-auth-window",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no,scrollbars=yes,resizable=yes,noopener,noreferrer`
      );

      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        const popupError = new Error(
          "Popup was blocked by your browser. Please allow popups for this site and try again."
        );
        if (config.onError) {
          config.onError(popupError);
        }
        reject(popupError);
        cleanup();
      }

      const timeoutId = setTimeout(() => {
        window.removeEventListener("message", messageHandler);
        cleanup();
        const timeoutError = new Error(
          "Authentication timed out after 5 minutes"
        );
        if (config.onError) {
          config.onError(timeoutError);
        }
        reject(timeoutError);
      }, 5 * 60 * 1000);

      const originalResolve = resolve;
      const originalReject = reject;
      resolve = () => {
        clearTimeout(timeoutId);
        originalResolve();
      };
      reject = (reason) => {
        clearTimeout(timeoutId);
        originalReject(reason);
      };
    });

    await authPromise;
  } catch (error) {
    cleanup();
    if (error instanceof Error && config.onError) {
      config.onError(error);
    } else if (config.onError) {
      config.onError(
        new Error("An unknown error occurred during authentication")
      );
    }
    console.error("Facebook authentication error:", error);
  }
};

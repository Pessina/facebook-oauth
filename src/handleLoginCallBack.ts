/**
 * Handles the callback from Facebook OAuth login process
 *
 * This function processes the URL parameters returned from Facebook's OAuth flow,
 * extracts the authorization code and state, and communicates the result back to
 * the opener window through postMessage.
 *
 * @param searchParams - URLSearchParams object containing the callback parameters
 */
export const handleLoginCallBack = (searchParams: URLSearchParams) => {
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  if (window.opener) {
    if (error || errorReason) {
      window.opener.postMessage(
        {
          type: "FACEBOOK_AUTH_ERROR",
          error: error || errorReason || "Authentication failed",
        },
        window.location.origin
      );
    } else if (code && state) {
      window.opener.postMessage(
        {
          type: "FACEBOOK_AUTH_SUCCESS",
          code,
          returnedState: state,
        },
        window.location.origin
      );
    }

    window.close();
  }
};

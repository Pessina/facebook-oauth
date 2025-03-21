export const handleLoginCallBack = () => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const code = urlSearchParams.get("code");
  const state = urlSearchParams.get("state");
  const error = urlSearchParams.get("error");
  const errorReason = urlSearchParams.get("error_reason");

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

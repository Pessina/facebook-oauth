# Facebook OAuth

A TypeScript library for implementing Facebook OAuth with PKCE (Proof Key for Code Exchange) in modern browsers. This package provides secure authentication with Facebook's OAuth system using the PKCE flow, which is more secure than traditional OAuth.

## Features

- 🔒 Secure authentication using PKCE flow
- 🌐 Works in modern browsers (requires Web Crypto API)
- ⚛️ React integration with hooks
- 🔄 Handles OAuth redirects and popup windows
- 🧩 Can be used without React (vanilla JS/TS)
- 📦 Built with TypeScript for type safety

## Installation

```bash
# npm
npm install facebook-oauth

# yarn
yarn add facebook-oauth

# pnpm
pnpm add facebook-oauth
```

## Basic Usage

### 1. Create a Facebook App

Before using this library, make sure you have set up a Facebook application:

1. Go to the [Facebook Developer Portal](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Set up the OAuth configuration with valid redirect URIs
4. Get your App ID

### 2. Configure Your Authentication Flow

There are two ways to use this library:

## React Usage

### Option 1: Using the React Hook

Add the `FacebookAuthProvider` at your app's root level for handling callbacks:

```jsx
import { FacebookAuthProvider } from "facebook-oauth";

function App() {
  return (
    <FacebookAuthProvider>
      <YourAppContent />
    </FacebookAuthProvider>
  );
}
```

Then use the hook in your components:

```jsx
import { useFacebookAuth } from "facebook-oauth";

function LoginButton() {
  const { initiateLogin } = useFacebookAuth({
    appId: "YOUR_FACEBOOK_APP_ID",
    scope: "email,public_profile", // Comma-separated list of permissions
    onSuccess: (idToken) => {
      console.log("Login successful!", idToken);
      // Perform actions with the token, like saving to state or sending to your server
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Handle errors
    },
  });

  return (
    <button
      onClick={() => initiateLogin()}
      style={{
        backgroundColor: "#1877F2",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Login with Facebook
    </button>
  );
}
```

### Complete React Example

Here's a more complete example with TypeScript:

```tsx
import React from "react";
import { FacebookAuthProvider, useFacebookAuth } from "facebook-oauth";

// Root component with provider
function App() {
  return (
    <FacebookAuthProvider>
      <div className="app">
        <h1>My Application</h1>
        <LoginSection />
      </div>
    </FacebookAuthProvider>
  );
}

// Login component
function LoginSection() {
  const [user, setUser] = React.useState<{ idToken?: string } | null>(null);

  const handleLoginSuccess = (idToken?: string) => {
    setUser({ idToken });
  };

  const handleLoginError = (error: Error) => {
    console.error("Login failed:", error);
    alert(`Login error: ${error.message}`);
  };

  return (
    <div>
      {user ? (
        <div>
          <p>You are logged in!</p>
          <button onClick={() => setUser(null)}>Logout</button>
        </div>
      ) : (
        <FacebookLoginButton
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      )}
    </div>
  );
}

// Reusable login button
type FacebookButtonProps = {
  onSuccess: (idToken?: string) => void;
  onError: (error: Error) => void;
  text?: string;
  nonce?: string;
};

function FacebookLoginButton({
  onSuccess,
  onError,
  text = "Login with Facebook",
  nonce,
}: FacebookButtonProps) {
  const { initiateLogin } = useFacebookAuth({
    appId: "YOUR_FACEBOOK_APP_ID", // Replace with your App ID
    scope: "email,public_profile",
    onSuccess,
    onError,
  });

  return (
    <button
      onClick={() => initiateLogin({ nonce })}
      style={{
        backgroundColor: "#1877F2",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {text}
    </button>
  );
}

export default App;
```

## Vanilla JavaScript/TypeScript Usage

If you're not using React, you can still use the package with the raw functions:

```ts
import { initiateLogin, handleLoginCallBack } from "facebook-oauth";

// Call this function when your page loads to handle OAuth redirects
// This is needed on your callback page
window.addEventListener("load", () => {
  handleLoginCallBack();
});

// Add a login button handler
document.getElementById("loginButton")?.addEventListener("click", async () => {
  await initiateLogin({
    appId: "YOUR_FACEBOOK_APP_ID",
    scope: "email,public_profile",
    onSuccess: (idToken) => {
      console.log("Logged in successfully!", idToken);
      // Proceed with your app logic
    },
    onError: (error) => {
      console.error("Login failed:", error);
      // Handle errors
    },
  });
});
```

## Configuration Options

The `initiateLogin` function and `useFacebookAuth` hook accept the following options:

| Option       | Type                       | Required | Description                                                |
| ------------ | -------------------------- | -------- | ---------------------------------------------------------- |
| appId        | string                     | Yes      | Your Facebook App ID                                       |
| scope        | string                     | No       | Comma-separated list of permissions                        |
| nonce        | string                     | No       | Custom nonce for security (auto-generated if not provided) |
| callbackUri  | string                     | No       | Custom redirect URI (defaults to current URL)              |
| responseType | "code"                     | No       | OAuth response type (only "code" is supported)             |
| onSuccess    | (idToken?: string) => void | No       | Success callback with the ID token                         |
| onError      | (error: Error) => void     | No       | Error callback                                             |

## Security Considerations

This package implements OAuth PKCE, which is more secure than standard OAuth for public clients. Key security features:

- Uses cryptographically secure code verifiers and challenges
- State parameters to prevent CSRF attacks
- Supports nonce parameters for replay protection
- Uses secure storage when available

## Troubleshooting

### Common Issues

1. **Popup Blocked**: Make sure your browser allows popups for your site.
2. **Redirect Issues**: Ensure your callback URI is correctly registered in the Facebook Developer Console.
3. **CORS Errors**: Check that your domain is properly configured in the Facebook app settings.

### Facebook Errors

If Facebook returns an error, the `onError` callback will be triggered with the error message from Facebook.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

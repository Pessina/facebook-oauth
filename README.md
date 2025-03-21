# Facebook OAuth

A TypeScript library for implementing Facebook OAuth using PKCE

## Installation

```bash
# npm
npm install facebook-oauth

# yarn
yarn add facebook-oauth

# pnpm
pnpm add facebook-oauth
```

## Usage

```ts twoslash
import { useFacebookAuth } from "facebook-oauth";

type FacebookButtonProps = {
  text: string;
  onSuccess: (idToken: string) => void;
  onError: (error: Error) => void;
  nonce?: string;
};

export default function FacebookButton({
  text,
  onSuccess,
  onError,
  nonce,
}: FacebookButtonProps) {
  const { initiateLogin } = useFacebookAuth({
    scope: "email",
    appId: "your-facebook-app-id",
    onSuccess: (idToken) => {
      if (idToken) {
        onSuccess(idToken);
      } else {
        onError(new Error("No token received from Facebook"));
      }
    },
    onError: (error: Error) => {
      onError(error);
    },
  });

  const handleLogin = async () => {
    await initiateLogin({
      nonce: nonce,
    });
  };

  return <button onClick={handleLogin}>{text}</button>;
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

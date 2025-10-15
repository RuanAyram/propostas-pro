import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/sign-in?after_auth_return_to=/",
    signUp: "/auth/sign-up?after_auth_return_to=/",
    forgotPassword: "/auth/forgot-password",
    emailVerification: "/auth/email-verification",
    accountSettings: "/auth/account-settings",
    home: "/",
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/auth/sign-in",
  },
});

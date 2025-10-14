import "server-only";

import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
    emailVerification: "/auth/email-verification",
    accountSettings: "/auth/account-settings",
    home: "/",
    afterSignIn: "/",
    afterSignUp: "/",
    afterSignOut: "/auth/sign-in",
  },
});

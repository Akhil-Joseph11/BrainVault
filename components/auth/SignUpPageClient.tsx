"use client";

import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import BrainVaultLogo from "@/components/BrainVaultLogo";

const clerkAppearance = {
  elements: {
    rootBox: "w-full max-w-full mx-auto",
    card: "bg-transparent shadow-none w-full max-w-full",
    cardBox: "w-full max-w-full",
    header: "text-center",
    headerTitle: "text-silver-200 font-bold text-2xl",
    headerSubtitle: "text-silver-400/70 text-sm",
    socialButtonsBlockButton:
      "bg-silver-500/10 border border-silver-500/20 text-silver-200 hover:bg-silver-500/20 transition-all duration-300 w-full",
    socialButtonsBlockButtonText: "text-silver-200 font-medium",
    formButtonPrimary:
      "bg-gradient-to-r from-silver-400 to-silver-500 text-black hover:from-silver-300 hover:to-silver-400 transition-all duration-300 font-semibold w-full",
    formFieldInput:
      "bg-black/40 border-silver-500/20 text-silver-100 placeholder:text-silver-500/50 focus:border-silver-400/50 focus:ring-silver-400/50 w-full",
    formFieldLabel: "text-silver-300 font-medium",
    dividerLine: "bg-silver-500/20",
    dividerText: "text-silver-400/70",
    formFieldInputShowPasswordButton: "text-silver-400 hover:text-silver-300",
    footerActionLink: "text-silver-400 hover:text-silver-300",
    identityPreviewText: "text-silver-200",
    identityPreviewEditButton: "text-silver-400 hover:text-silver-300",
    formResendCodeLink: "text-silver-400 hover:text-silver-300",
    footerAction: "text-silver-400/70 text-center",
    form: "w-full",
    formFields: "w-full",
  },
  variables: {
    colorPrimary: "#c0c0c0",
    colorBackground: "#000000",
    colorInputBackground: "rgba(0, 0, 0, 0.4)",
    colorInputText: "#e5e5e5",
    colorText: "#c0c0c0",
    colorTextSecondary: "rgba(192, 192, 192, 0.7)",
    borderRadius: "0.75rem",
  },
} as const;

function SignUpFallback() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-silver-500/25 border-t-silver-400"
        aria-label="Loading sign up"
      />
    </div>
  );
}

export default function SignUpPageClient() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111] py-8">
      <div
        className="pointer-events-none fixed -right-20 top-0 z-0 h-[22rem] w-[22rem] rounded-full bg-gradient-to-bl from-silver-500/15 to-transparent blur-3xl animate-float-slow motion-reduce:animate-none"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -bottom-24 -left-16 z-0 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-silver-600/10 to-transparent blur-3xl animate-float-slower motion-reduce:animate-none"
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-silver-500/5 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center px-4">
        <div className="mb-8 flex w-full justify-center animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100">
          <BrainVaultLogo size="lg" showText={true} />
        </div>
        <div className="w-full overflow-hidden rounded-2xl border border-silver-500/10 bg-black/40 p-6 shadow-2xl backdrop-blur-xl animate-fade-in-up motion-reduce:animate-none motion-reduce:opacity-100 [animation-delay:90ms] motion-reduce:[animation-delay:0ms] sm:p-8">
          <div className="flex w-full justify-center">
            <Suspense fallback={<SignUpFallback />}>
              <SignUp appearance={clerkAppearance} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

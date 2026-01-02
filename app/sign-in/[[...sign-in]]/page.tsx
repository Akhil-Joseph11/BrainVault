import { SignIn } from "@clerk/nextjs";
import BrainVaultLogo from "@/components/BrainVaultLogo";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-[#0a0a0a] to-[#111111] relative overflow-hidden py-8">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-silver-500/5 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative w-full max-w-md mx-auto px-4 flex flex-col items-center">
        <div className="mb-8 w-full flex justify-center">
          <BrainVaultLogo size="lg" showText={true} />
        </div>
        <div className="w-full bg-black/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-silver-500/10 p-6 sm:p-8 overflow-hidden">
          <div className="w-full flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-full mx-auto",
                  card: "bg-transparent shadow-none w-full max-w-full",
                  cardBox: "w-full max-w-full",
                  header: "text-center",
                  headerTitle: "text-silver-200 font-bold text-2xl",
                  headerSubtitle: "text-silver-400/70 text-sm",
                  socialButtonsBlockButton: "bg-silver-500/10 border border-silver-500/20 text-silver-200 hover:bg-silver-500/20 transition-all duration-300 w-full",
                  socialButtonsBlockButtonText: "text-silver-200 font-medium",
                  formButtonPrimary: "bg-gradient-to-r from-silver-400 to-silver-500 text-black hover:from-silver-300 hover:to-silver-400 transition-all duration-300 font-semibold w-full",
                  formFieldInput: "bg-black/40 border-silver-500/20 text-silver-100 placeholder:text-silver-500/50 focus:border-silver-400/50 focus:ring-silver-400/50 w-full",
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
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


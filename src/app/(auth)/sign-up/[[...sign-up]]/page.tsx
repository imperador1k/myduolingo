import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <SignUp
            appearance={{
                elements: {
                    formButtonPrimary:
                        "bg-green-500 hover:bg-green-600 text-white border-b-4 border-green-600 active:border-b-0 active:translate-y-[2px]",
                    card: "rounded-2xl shadow-xl",
                    headerTitle: "text-2xl font-bold text-slate-700",
                    headerSubtitle: "text-slate-500",
                    socialButtonsBlockButton:
                        "border-2 border-slate-200 hover:border-green-300 hover:bg-green-50",
                    formFieldInput:
                        "rounded-xl border-2 border-slate-200 focus:border-green-500 focus:ring-green-500",
                    footerActionLink: "text-green-500 hover:text-green-600 font-bold",
                },
            }}
            afterSignUpUrl="/learn"
            signInUrl="/sign-in"
        />
    );
}

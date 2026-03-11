import { Metadata } from "next";

export const metadata: Metadata = {
    title: "CEFR Placement Test - MyDuolingo",
    description: "Descobre o teu nível CEFR com o nosso teste de nivelamento adaptativo.",
};

export default function EvaluationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

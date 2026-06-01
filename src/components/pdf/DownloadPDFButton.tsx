"use client";

import dynamic from "next/dynamic";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardMetrics } from "@/lib/scoring";
import { UserDetails, TestAnswers } from "@/store/useTestStore";

// Dynamically import the wrapper component to prevent SSR issues with @react-pdf/renderer in Next.js 15
const PDFLinkWrapper = dynamic(
  () => import("./PDFLinkWrapper"),
  { ssr: false, loading: () => <Button disabled className="gap-2 bg-[#1E88FF]/50 text-white"><Download size={16} /> Preparing PDF...</Button> }
);

interface Props {
  metrics: DashboardMetrics;
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

export function DownloadPDFButton({ metrics, user, answers }: Props) {
  const fileName = `BharosaBhai_Plan_${user.name?.replace(/\s+/g, '') || 'User'}.pdf`;

  return <PDFLinkWrapper metrics={metrics} user={user} answers={answers} fileName={fileName} />;
}

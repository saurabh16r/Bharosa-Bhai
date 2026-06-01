"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { FinancialReportPDF } from "./FinancialReportPDF";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export default function PDFLinkWrapper({ metrics, user, answers, fileName }: any) {
  return (
    <PDFDownloadLink
      document={<FinancialReportPDF metrics={metrics} user={user} answers={answers} />}
      fileName={fileName}
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <Button 
          disabled={loading} 
          className="gap-2 bg-[#1E88FF] text-white hover:bg-[#1E88FF]/90 font-medium"
        >
          <Download size={16} /> {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

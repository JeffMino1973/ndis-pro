import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Send, Loader2, Paperclip, CheckCircle, AlertCircle } from "lucide-react";

const INVOICE_TEMPLATE_URL = "https://media.base44.com/files/public/69d54775d9a169daad84a133/1189154e2_Invoice_Email.html";
const PAYSLIP_TEMPLATE_URL = "https://media.base44.com/files/public/69d54775d9a169daad84a133/c23215a33_Payslip_Advice.html";

function mergeTemplate(html, data) {
  let result = html;
  // Replace [Field Name] style (invoice template)
  result = result.replace(/\[([^\]]+)\]/g, (match, key) => {
    const trimmed = key.trim();
    if (trimmed in data) return String(data[trimmed] ?? "");
    return match;
  });
  // Replace (Field_Name) style (payslip template)
  result = result.replace(/\(([^)]+)\)/g, (match, key) => {
    const trimmed = key.trim();
    if (trimmed in data) return String(data[trimmed] ?? "");
    return match;
  });
  return result;
}

export function buildInvoiceMergeData(invoice, config) {
  return {
    "Invoice Number": invoice.invoice_number || "",
    "Plan Manager Name": invoice.plan_manager_name || "",
    "Participant Name": invoice.participant_name || "",
    "NDIS Number": invoice.participant_ndis_number || "",
    "Invoice Date": invoice.issue_date || "",
    "Bank Name": config.bankName || "",
    "Account Name": config.accountName || "",
    "BSB": config.bsb || "",
    "Account Number": config.accountNumber || "",
    "Sender Name": config.businessName || "SZ-Jie Support Services",
  };
}

export function buildPayslipMergeData(record) {
  const lines = record.line_items || [];
  const totalHours = lines.reduce((a, l) => a + parseFloat(l.qty || 0), 0);
  const lineTotal = (l) => parseFloat(l.unit_price || 0) * parseFloat(l.qty || 0);
  const gross = lines.reduce((a, l) => a + lineTotal(l), 0);
  return {
    "Pay_Period_Start": record.date_from || "",
    "Pay_Period_End": record.date_to || "",
    "Employee_Name": record.staff_name || "",
    "Pay_Date": new Date().toLocaleDateString("en-AU"),
    "Hours_Worked": totalHours.toFixed(2),
    "Hourly_Rate": totalHours > 0 ? (gross / totalHours).toFixed(2) : "0.00",
    "Gross_Pay": `$${(record.gross_pay || gross || 0).toFixed(2)}`,
    "Tax_Withheld": `$${(record.tax || 0).toFixed(2)}`,
    "Superannuation_Amount": `$${(record.super_amount || 0).toFixed(2)}`,
    "Net_Pay": `$${(record.net_pay || 0).toFixed(2)}`,
    "Payment_Made_To": record.bank_account_name || record.staff_name || "",
    "Bank_Name": record.bank_name || "",
    "Account_Name": record.bank_account_name || "",
    "BSB": record.bank_bsb || "",
    "Account_Number": record.bank_account_number || "",
    "Payroll_Officer_Name": "SZ-Jie Support Services",
    "Payroll_Officer_Position": "Payroll Department",
  };
}

export default function EmailMergeDialog({
  open,
  onClose,
  type = "invoice",
  mergeData = {},
  defaultRecipient = "",
  defaultSubject = "",
  attachmentHtml = null,
  attachmentFilename = "document.html",
}) {
  const [templateHtml, setTemplateHtml] = useState("");
  const [mergedHtml, setMergedHtml] = useState("");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const templateUrl = type === "payslip" ? PAYSLIP_TEMPLATE_URL : INVOICE_TEMPLATE_URL;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    setSent(false);
    fetch(templateUrl)
      .then(r => r.text())
      .then(html => {
        const merged = mergeTemplate(html, mergeData);
        setTemplateHtml(html);
        setMergedHtml(merged);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load email template");
        setLoading(false);
      });
  }, [open, templateUrl]);

  useEffect(() => {
    setRecipient(defaultRecipient);
    setSubject(defaultSubject);
  }, [defaultRecipient, defaultSubject]);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const payload = {
        action: "send",
        to: recipient,
        subject,
        body: mergedHtml,
      };
      if (cc) payload.cc = cc;

      if (attachmentHtml) {
        // UTF-8 safe base64 encoding
        const bytes = new TextEncoder().encode(attachmentHtml);
        let binary = "";
        bytes.forEach(b => binary += String.fromCharCode(b));
        payload.attachments = [{
          filename: attachmentFilename,
          mimeType: "text/html",
          content: btoa(binary),
        }];
      }

      const res = await base44.functions.invoke("gmailMessages", payload);
      if (res.data?.error) throw new Error(res.data.error);
      setSent(true);
    } catch (e) {
      setError(e.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={18} /> {type === "payslip" ? "Email Payslip" : "Email Invoice"}
          </DialogTitle>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-black">Email Sent!</h3>
            <p className="text-muted-foreground text-sm">The email has been sent to {recipient}</p>
            <Button onClick={onClose} className="rounded-xl">Close</Button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground text-sm font-bold">Loading email template…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-xs font-bold">To</Label>
                <Input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="recipient@email.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold">CC (optional)</Label>
                  <Input value={cc} onChange={e => setCc(e.target.value)} placeholder="cc@email.com" />
                </div>
                <div>
                  <Label className="text-xs font-bold">Subject</Label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
              </div>
            </div>

            {attachmentHtml && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
                <Paperclip size={14} /> Attachment: <strong>{attachmentFilename}</strong>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold mb-2 block">Email Preview</Label>
              <div className="border border-border rounded-xl overflow-hidden bg-secondary/20">
                <iframe srcDoc={mergedHtml} title="Email Preview" className="w-full" style={{ height: "450px", border: "none" }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSend} disabled={!recipient || !subject || sending} className="rounded-xl gap-2">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {sending ? "Sending…" : "Send Email"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
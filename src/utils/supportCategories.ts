// Main support categories for IT assistant
export interface SupportCategory {
  icon: string;
  title: string;
}

export const MAIN_SUPPORT_CATEGORIES: SupportCategory[] = [
  { icon: "🔑", title: "Login / Password Reset" },
  { icon: "💻", title: "New Laptop / Hardware / Software Request" },
  { icon: "🌐", title: "VPN / Remote Access" },
  {
    icon: "📂",
    title: "Application Issues (AS400, DealerLink, IBM Notes, etc.)",
  },
  { icon: "📧", title: "Email / Outlook" },
  { icon: "🖨️", title: "Printer / Peripheral" },
  { icon: "📞", title: "Microsoft Teams / Phone" },
  { icon: "🔄", title: "Windows Updates / System Performance" },
] as const;

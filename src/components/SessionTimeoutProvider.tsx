"use client";

import { useSessionTimeout } from "@/hooks/use-session-timeout";

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider = ({
  children,
}: SessionTimeoutProviderProps) => {
  // Initialize session timeout with custom settings
  useSessionTimeout({
    timeoutDuration: 15 * 60 * 1000, // 15 minutes
    checkInterval: 30 * 1000, // check every 30 seconds
  });

  return <>{children}</>;
};

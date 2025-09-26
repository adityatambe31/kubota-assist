import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface SessionTimeoutOptions {
  timeoutDuration?: number; // in milliseconds, default 15 minutes
  checkInterval?: number; // how often to check, default 1 minute
}

export const useSessionTimeout = (options: SessionTimeoutOptions = {}) => {
  const {
    timeoutDuration = 15 * 60 * 1000, // 15 minutes
    checkInterval = 60 * 1000, // check every minute
  } = options;

  const { signOut, isSignedIn } = useAuth();
  const router = useRouter();

  const lastActivityRef = useRef(Date.now());
  const checkTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update last activity time
  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Logout function
  const logout = async () => {
    if (checkTimerRef.current) {
      clearTimeout(checkTimerRef.current);
    }
    await signOut();
    router.push("/");
  };

  // Check session timeout
  const checkTimeout = () => {
    if (!isSignedIn) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;

    if (timeSinceActivity >= timeoutDuration) {
      // Time expired, logout immediately
      logout();
    }
  };

  // Setup event listeners for activity tracking
  useEffect(() => {
    if (!isSignedIn) return;

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add activity listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Page visibility change handler
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from page - reduce remaining time
        lastActivityRef.current = Date.now() - timeoutDuration * 0.7;
      } else {
        // User returned to page
        const timeSinceHidden = Date.now() - lastActivityRef.current;
        if (timeSinceHidden > timeoutDuration * 0.8) {
          // If away too long, logout immediately
          logout();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start timeout checking
    checkTimerRef.current = setInterval(checkTimeout, checkInterval);

    return () => {
      // Cleanup
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (checkTimerRef.current) {
        clearTimeout(checkTimerRef.current);
      }
    };
  }, [isSignedIn, timeoutDuration, checkInterval]);
};

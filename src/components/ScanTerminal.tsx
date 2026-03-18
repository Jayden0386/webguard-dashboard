import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { type ScanLog } from "@/lib/scanner-types";

export function ScanTerminal({ logs }: { logs: ScanLog[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const logColor: Record<string, string> = {
    info: "text-muted-foreground",
    check: "text-secondary-foreground",
    found: "text-warning",
    done: "text-success",
  };

  return (
    <div className="surface-card overflow-hidden max-w-2xl mx-auto">
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
        </div>
        <span className="text-xs text-muted-foreground font-mono ml-2">scan output</span>
      </div>
      <div ref={scrollRef} className="p-4 max-h-48 overflow-y-auto space-y-1">
        {logs.map((log, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={`text-xs font-mono ${logColor[log.type] || "text-foreground"}`}
          >
            <span className="text-muted-foreground/50 mr-2">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
            </span>
            {log.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

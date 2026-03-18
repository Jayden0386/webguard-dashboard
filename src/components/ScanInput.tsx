import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface ScanInputProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

export function ScanInput({ onScan, isScanning }: ScanInputProps) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    // Add https:// if missing
    const finalUrl = trimmed.match(/^https?:\/\//) ? trimmed : `https://${trimmed}`;
    onScan(finalUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isScanning}
          className="w-full h-16 bg-card border border-border rounded-2xl pl-14 pr-40 text-base font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all disabled:opacity-60"
          placeholder="https://example.com"
        />
        <motion.button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="absolute right-3 top-3 bottom-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          whileTap={{ scale: 0.97 }}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Analyze Site"
          )}
        </motion.button>
      </div>
    </form>
  );
}

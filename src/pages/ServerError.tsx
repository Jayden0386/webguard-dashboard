import { Shield } from "lucide-react";

const ServerError = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center space-y-6">
        <Shield className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-6xl font-display font-bold text-foreground">500</h1>
        <p className="text-lg font-body text-muted-foreground">Something went wrong</p>
        <p className="text-sm font-body text-muted-foreground max-w-sm">
          An unexpected error occurred. Please try again later.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default ServerError;

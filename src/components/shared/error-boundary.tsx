import { Component } from "react";
import type { ReactNode } from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Что-то пошло не так.</p>
          <p className="mt-1 font-mono text-sm text-destructive">
            {this.state.error.message}
          </p>
          <button
            className="mt-4 text-sm text-primary hover:opacity-75"
            onClick={() => {
              this.setState({ error: null });
            }}
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

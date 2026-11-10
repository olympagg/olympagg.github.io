import { Component } from "react";
import type { ReactNode } from "react";

// Chrome/Firefox: "...dynamically imported module...", Safari: "Importing a module script failed."
const CHUNK_LOAD_ERROR =
  /dynamically imported module|Importing a module script failed/;

function isChunkLoadError(error: Error | null): boolean {
  return error !== null && CHUNK_LOAD_ERROR.test(error.message);
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Что-то пошло не так.</p>
          <p className="mt-1 font-mono text-sm text-destructive">
            {this.state.error.message}
          </p>
          <button
            className="mt-4 text-sm text-primary hover:opacity-75"
            onClick={() => {
              // A failed dynamic import stays rejected, so only a reload can retry it.
              if (isChunkLoadError(this.state.error)) {
                window.location.reload();
                return;
              }
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

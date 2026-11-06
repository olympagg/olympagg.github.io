import { Link } from "react-router";

import { routes } from "@/lib/routes";

export function NotFoundMessage({ message }: { message: string }) {
  return (
    <div className="space-y-3 py-10 text-center text-muted-foreground">
      <p>{message}</p>
      <Link
        to={routes.home()}
        className="text-sm underline hover:text-foreground"
      >
        На главную
      </Link>
    </div>
  );
}

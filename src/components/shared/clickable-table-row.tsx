import { useNavigate } from "react-router";

import { TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ClickableTableRowProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function ClickableTableRow({
  to,
  children,
  className,
}: ClickableTableRowProps) {
  const navigate = useNavigate();
  return (
    <TableRow
      tabIndex={0}
      role="link"
      className={cn(
        "cursor-pointer hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
        className,
      )}
      onClick={() => navigate(to)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          void navigate(to);
        }
      }}
    >
      {children}
    </TableRow>
  );
}

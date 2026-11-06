import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TaskScore } from "@/data/types/base";
import { formatNumber } from "@/lib/utils";

function ScoreValue({ score, maxScore }: { score: number; maxScore?: number }) {
  return (
    <span className="font-mono">
      {formatNumber(score)}
      {maxScore != null && (
        <span className="text-muted-foreground">/{formatNumber(maxScore)}</span>
      )}
    </span>
  );
}

interface TaskScoreTableProps {
  title: string;
  tasks: TaskScore[];
}

export function TaskScoreTable({ title, tasks }: TaskScoreTableProps) {
  const horizontal = tasks.every((task) => task.name.length < 3);

  return (
    <div>
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          {horizontal ? (
            <>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  {tasks.map((task, index) => (
                    <TableHead
                      key={`${task.name}-${index}`}
                      className="text-center font-medium text-foreground"
                    >
                      {task.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {tasks.map((task, index) => (
                    <TableCell
                      key={`${task.name}-${index}`}
                      className="text-center"
                    >
                      <ScoreValue score={task.score} maxScore={task.maxScore} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </>
          ) : (
            <>
              <TableHeader>
                <TableRow>
                  <TableHead>Задача</TableHead>
                  <TableHead className="w-24 text-right">Балл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={`${task.name}-${index}`}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell className="text-right">
                      <ScoreValue score={task.score} maxScore={task.maxScore} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
        </Table>
      </div>
    </div>
  );
}

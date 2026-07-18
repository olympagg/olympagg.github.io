export function NotFoundMessage({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-muted-foreground">{message}</div>
  );
}

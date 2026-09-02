type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({
  title,
  message,
}: EmptyStateProps) {
  return (
    <div className="state-card">
      <span className="state-card-kicker">SEM RESULTADOS</span>
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

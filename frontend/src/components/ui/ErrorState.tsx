type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "ALGO DEU ERRADO",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-card state-card-error">
      <span className="state-card-kicker">{title}</span>
      <strong>{message}</strong>

      {onRetry && (
        <button type="button" onClick={onRetry}>
          TENTAR NOVAMENTE
        </button>
      )}
    </div>
  );
}

type LoadingStateProps = {
  title?: string;
  message?: string;
};

export function LoadingState({
  title = "CARREGANDO",
  message = "Buscando informações...",
}: LoadingStateProps) {
  return (
    <div className="state-card state-card-loading">
      <span className="state-card-kicker">{title}</span>
      <strong>{message}</strong>
      <div className="state-card-pulse" />
    </div>
  );
}

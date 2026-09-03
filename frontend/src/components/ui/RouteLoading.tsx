export function RouteLoading() {
  return (
    <main className="route-loading">
      <div className="route-loading-inner" role="status" aria-live="polite">
        <span className="route-loading-brand">
          ELITE<span>/TICKETS</span>
        </span>

        <div className="route-loading-track" aria-hidden="true">
          <span />
        </div>

        <p>CARREGANDO PÁGINA</p>
      </div>
    </main>
  );
}

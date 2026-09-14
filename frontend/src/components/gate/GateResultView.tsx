import type { GateResult } from "../../services/gate.service";
import { formatDate } from "../../utils/date";

type GateResultViewProps = {
  result: GateResult;
  onReset: () => void;
};

function getResultLabel(status: GateResult["status"]) {
  if (status === "VALID") return "ENTRADA LIBERADA";
  if (status === "ALREADY_USED") return "JÁ UTILIZADO";
  if (status === "WRONG_EVENT") return "EVENTO INCORRETO";
  return "INGRESSO INVÁLIDO";
}

export function GateResultView({
  result,
  onReset,
}: GateResultViewProps) {
  const resultClass = `gate-result gate-result-${result.status.toLowerCase()}`;

  return (
    <section className={resultClass} aria-live="polite">
      <span className="gate-result-label">
        RESULTADO / PORTARIA
      </span>

      <h2 className="gate-result-status">
        {getResultLabel(result.status)}
      </h2>

      <p>{result.message}</p>

      {"validatedAt" in result && result.validatedAt && (
        <small>
          Validação anterior: {formatDate(result.validatedAt)}
        </small>
      )}

      <button type="button" onClick={onReset}>
        VALIDAR PRÓXIMO INGRESSO →
      </button>
    </section>
  );
}

import type {
  EventSeat,
} from "../../types/event";

type SeatMapProps = {
  seats: EventSeat[];
  selectedSeatIds: string[];
  maxSelection: number;
  disabled?: boolean;
  onToggle: (
    seat: EventSeat,
  ) => void;
};

export function SeatMap({
  seats,
  selectedSeatIds,
  maxSelection,
  disabled = false,
  onToggle,
}: SeatMapProps) {
  const rows =
    seats.reduce<
      Record<string, EventSeat[]>
    >(
      (groups, seat) => {
        if (!groups[seat.row]) {
          groups[seat.row] = [];
        }

        groups[seat.row].push(
          seat,
        );

        return groups;
      },
      {},
    );

  const maxReached =
    selectedSeatIds.length >=
    maxSelection;

  return (
    <div className="seat-map">
      <div className="seat-map-heading">
        <strong>
          ESCOLHA OS LUGARES
        </strong>

        <span>
          MÁX.{" "}
          {String(
            maxSelection,
          ).padStart(2, "0")}
        </span>
      </div>

      <div className="seat-map-viewport">
        <div className="seat-map-room">
          <div className="seat-map-screen">
            <span>TELA</span>
            <div />
          </div>

          <div className="seat-map-rows">
            {Object.entries(
              rows,
            ).map(
              ([row, rowSeats]) => (
                <div
                  key={row}
                  className="seat-map-row"
                >
                  <span className="seat-map-row-label">
                    {row}
                  </span>

                  <div className="seat-map-row-seats">
                    {rowSeats.map(
                      (
                        seat,
                        index,
                      ) => {
                        const selected =
                          selectedSeatIds.includes(
                            seat.id,
                          );

                        const occupied =
                          seat.status !==
                          "AVAILABLE";

                        const unavailableByLimit =
                          maxReached &&
                          !selected;

                        const isDisabled =
                          disabled ||
                          occupied ||
                          unavailableByLimit;

                        return (
                          <button
                            key={
                              seat.id
                            }
                            type="button"
                            className={[
                              "seat-map-seat",
                              selected
                                ? "is-selected"
                                : "",
                              occupied
                                ? "is-occupied"
                                : "",
                              index ===
                              4
                                ? "has-aisle"
                                : "",
                            ]
                              .filter(
                                Boolean,
                              )
                              .join(
                                " ",
                              )}
                            disabled={
                              isDisabled
                            }
                            aria-pressed={
                              selected
                            }
                            aria-label={
                              occupied
                                ? `Lugar ${seat.label} ocupado`
                                : selected
                                  ? `Lugar ${seat.label} selecionado`
                                  : `Selecionar lugar ${seat.label}`
                            }
                            title={
                              seat.label
                            }
                            onClick={() =>
                              onToggle(
                                seat,
                              )
                            }
                          >
                            <span>
                              {String(
                                seat.number,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="seat-map-legend">
        <div>
          <span className="seat-map-legend-seat" />
          LIVRE
        </div>

        <div>
          <span className="seat-map-legend-seat is-selected" />
          SELECIONADO
        </div>

        <div>
          <span className="seat-map-legend-seat is-occupied" />
          OCUPADO
        </div>
      </div>
    </div>
  );
}
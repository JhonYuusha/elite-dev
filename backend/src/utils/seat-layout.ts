const SEATS_PER_ROW = 8;

export type GeneratedSeat = {
  row: string;
  number: number;
  label: string;
};

function getRowLabel(
  rowIndex: number,
) {
  let value = rowIndex + 1;
  let label = "";

  while (value > 0) {
    const remainder =
      (value - 1) % 26;

    label =
      String.fromCharCode(
        65 + remainder,
      ) + label;

    value = Math.floor(
      (value - 1) / 26,
    );
  }

  return label;
}

export function generateSeatLayout(
  quantity: number,
  offset = 0,
): GeneratedSeat[] {
  return Array.from(
    {
      length: quantity,
    },
    (_, index) => {
      const position =
        offset + index;

      const rowIndex =
        Math.floor(
          position /
            SEATS_PER_ROW,
        );

      const number =
        (position %
          SEATS_PER_ROW) +
        1;

      const row =
        getRowLabel(rowIndex);

      return {
        row,
        number,
        label: `${row}${String(
          number,
        ).padStart(2, "0")}`,
      };
    },
  );
}

export function formatMoney(
  valueCents: number,
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    },
  ).format(valueCents / 100);
}

export function parseMoneyToCents(
  value: string,
) {
  const normalizedValue =
    Number(
      value
        .replace(".", "")
        .replace(",", "."),
    );

  if (
    !Number.isFinite(
      normalizedValue,
    ) ||
    normalizedValue <= 0
  ) {
    return null;
  }

  return Math.round(
    normalizedValue * 100,
  );
}

export function formatMoneyInput(
  valueCents: number,
) {
  return (valueCents / 100)
    .toFixed(2)
    .replace(".", ",");
}

export function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  )
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export function getMinDateTimeLocal() {
  const now = new Date();

  const localNow =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60_000,
    );

  return localNow
    .toISOString()
    .slice(0, 16);
}

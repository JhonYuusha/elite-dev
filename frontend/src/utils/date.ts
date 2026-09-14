export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export function formatScheduleDate(
  value: string,
) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(value))
    .replace(".", "")
    .toUpperCase();
}

export function formatLongDate(value: string) {
  const formatted =
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

  return (
    formatted.charAt(0).toUpperCase() +
    formatted.slice(1)
  );
}

export function getMinDateTimeLocal() {
  const now = new Date();

  const localNow = new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000,
  );

  return localNow
    .toISOString()
    .slice(0, 16);
}
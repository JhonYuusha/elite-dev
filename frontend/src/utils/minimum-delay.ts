export async function waitForMinimumDuration(
  startedAt: number,
  minimumDuration = 700,
) {
  const elapsed = performance.now() - startedAt;
  const remaining = minimumDuration - elapsed;

  if (remaining <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, remaining);
  });
}
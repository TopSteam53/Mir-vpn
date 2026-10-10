/** Отправляет цель в Метрику, если она подключена. */
export function reachGoal(goal: string) {
  const id = process.env.NEXT_PUBLIC_YM_ID;
  const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
  if (id && ym) ym(Number(id), "reachGoal", goal);
}

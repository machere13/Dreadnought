export function getChartSeriesIndex(id: string, count: number) {
  let hash = 0;
  for (const character of id) hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0;
  return hash % count;
}

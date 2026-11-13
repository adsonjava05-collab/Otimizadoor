const MS_PER_MINUTE = 60_000;

export function formatOrdersCount(count: number): string {
  return `${count} ${count === 1 ? 'pedido' : 'pedidos'}`;
}

export function formatScanDuration(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / MS_PER_MINUTE);
  if (totalMinutes < 1) return 'menos de 1 minuto';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourText = hours > 0 ? `${hours} ${hours === 1 ? 'hora' : 'horas'}` : '';
  const minuteText = minutes > 0 ? `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}` : '';

  if (hourText && minuteText) return `${hourText} e ${minuteText}`;
  return hourText || minuteText;
}

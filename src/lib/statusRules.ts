import type { StatusCor } from '@/types/dashboard'

type Indicador = 'cancelamento_total' | 'sla_preparo' | 'nsu' | 'ruptura_item' | 'sla_entrega' | 'tempo_online'

export function statusIndicador(indicador: Indicador, valor: number | null): StatusCor {
  if (valor === null) return 'neutro'
  switch (indicador) {
    case 'cancelamento_total':
      return valor <= 5  ? 'verde' : valor <= 7  ? 'amarelo' : 'vermelho'
    case 'sla_preparo':
      return valor >= 85 ? 'verde' : valor >= 75 ? 'amarelo' : 'vermelho'
    case 'nsu':
      return valor <= 12 ? 'verde' : valor <= 13 ? 'amarelo' : 'vermelho'
    case 'ruptura_item':
      return valor <= 5  ? 'verde' : valor <= 7  ? 'amarelo' : 'vermelho'
    case 'sla_entrega':
      return valor >= 85 ? 'verde' : valor >= 75 ? 'amarelo' : 'vermelho'
    case 'tempo_online':
      return valor >= 95 ? 'verde' : valor >= 85 ? 'amarelo' : 'vermelho'
  }
}

export function statusMeta(venda: number | null, meta: number | null): 'Acima da meta' | 'Abaixo da meta' | '—' {
  if (venda === null || meta === null || meta === 0) return '—'
  return venda >= meta ? 'Acima da meta' : 'Abaixo da meta'
}

export function statusCancelamento(valor: number | null): StatusCor {
  return statusIndicador('cancelamento_total', valor)
}

export const COR_CLASSES: Record<StatusCor, { bg: string; text: string; border: string }> = {
  verde:    { bg: 'bg-success-light', text: 'text-success-text', border: 'border-success' },
  amarelo:  { bg: 'bg-warning-light', text: 'text-warning-text', border: 'border-warning' },
  vermelho: { bg: 'bg-danger-light',  text: 'text-danger-text',  border: 'border-danger' },
  neutro:   { bg: 'bg-neutral-light', text: 'text-neutral-text', border: 'border-neutral' },
}

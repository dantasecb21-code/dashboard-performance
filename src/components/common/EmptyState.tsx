export default function EmptyState({ title = 'Sem dados', description = 'Nenhum resultado encontrado para os filtros selecionados.' }: { title?: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-center p-8">
      <div className="text-4xl">📭</div>
      <h3 className="font-semibold text-foreground/80">{title}</h3>
      <p className="text-gray-400 text-sm max-w-xs">{description}</p>
    </div>
  )
}

export default function LoadingSpinner({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 border-2 border-slate-100 rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-400 text-sm font-medium">{label}</p>
    </div>
  )
}

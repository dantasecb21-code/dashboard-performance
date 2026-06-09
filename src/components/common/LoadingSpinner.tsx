export default function LoadingSpinner({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 border-2 border-[hsl(220_40%_14%)] rounded-full" />
        <div className="absolute inset-0 w-10 h-10 border-2 border-[hsl(177_100%_41%)] border-t-transparent rounded-full animate-spin" />
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(177 100% 41% / 0.15), transparent 70%)' }}
        />
      </div>
      <p className="text-[hsl(218_18%_45%)] text-sm font-medium">{label}</p>
    </div>
  )
}

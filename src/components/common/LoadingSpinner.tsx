export default function LoadingSpinner({ label = 'Carregando dados...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )
}

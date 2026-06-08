interface Props { message: string; onRetry?: () => void }
export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 text-center p-8">
      <div className="text-4xl">⚠️</div>
      <h3 className="font-semibold text-red-700">Erro ao carregar dados</h3>
      <p className="text-gray-500 text-sm max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm hover:bg-brand-600 transition">
          Tentar novamente
        </button>
      )}
    </div>
  )
}

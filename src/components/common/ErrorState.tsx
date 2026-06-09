import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props { message: string; onRetry?: () => void }

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center p-8">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground/90 mb-1">Erro ao carregar dados</h3>
        <p className="text-muted-foreground text-sm max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 mt-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 transition-colors font-medium cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}

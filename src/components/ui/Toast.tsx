import { Toast as ToastType } from '../../types'

interface ToastProps {
  toasts: ToastType[]
  onDismiss: (id: string) => void
}

const typeClasses = {
  success: 'bg-green-50 border-green-200 text-green-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

const typeIcons = {
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium
            shadow-md cursor-pointer animate-bounce-in ${typeClasses[toast.type]}`}
        >
          <span>{typeIcons[toast.type]}</span>
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  )
}

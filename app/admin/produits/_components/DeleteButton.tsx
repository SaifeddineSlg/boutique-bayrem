'use client'

interface Props {
  id: number
  name: string
  action: (formData: FormData) => Promise<void>
}

export default function DeleteButton({ id, name, action }: Props) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-xl transition-colors"
        onClick={(e) => {
          if (!confirm(`Supprimer "${name}" ?`)) e.preventDefault()
        }}
      >
        🗑️ Supprimer
      </button>
    </form>
  )
}

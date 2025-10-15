import { useState, useEffect } from 'react'

interface GameParentFormData {
  game_id: string
  game_name: string
}

interface GameParentFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: GameParentFormData) => Promise<void>
  game?: GameParentFormData | null
  mode: 'create' | 'edit'
}

const GameParentForm = ({ open, onClose, onSubmit, game, mode }: GameParentFormProps) => {
  const [formData, setFormData] = useState<GameParentFormData>({
    game_id: '',
    game_name: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (game && mode === 'edit') {
      setFormData({
        game_id: game.game_id,
        game_name: game.game_name
      })
    } else if (mode === 'create') {
      setFormData({
        game_id: '',
        game_name: ''
      })
    }
  }, [game, mode, open])

  const handleChange = (field: keyof GameParentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Form submit error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
          {mode === 'create' ? 'Add New Game' : 'Edit Game'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2.5 block text-black dark:text-white">Game ID *</label>
            <input
              type="text"
              value={formData.game_id}
              onChange={(e) => handleChange('game_id', e.target.value)}
              disabled={mode === 'edit'}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Game Name *</label>
            <input
              type="text"
              value={formData.game_name}
              onChange={(e) => handleChange('game_name', e.target.value)}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameParentForm

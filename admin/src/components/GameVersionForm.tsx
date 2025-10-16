import { useState, useEffect } from 'react'

interface GameVersionFormData {
  game_version: string
  description: string
  port_type: 'fixed' | 'range'
  port?: number
  port_start?: number
  port_end?: number
  api_url: string
  type: 'PROD' | 'TEST' | 'UAT'
  match_making_url?: string
  server_game_ip: string
  server_game_type: 'UDP' | 'TCP'
  is_active?: boolean
}

interface GameVersionFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: GameVersionFormData) => Promise<void>
  version?: GameVersionFormData | null
  mode: 'create' | 'edit'
  gameId: string
  gameName: string
}

const GameVersionForm = ({ open, onClose, onSubmit, version, mode, gameId, gameName }: GameVersionFormProps) => {
  const [formData, setFormData] = useState<GameVersionFormData>({
    game_version: '',
    description: '',
    port_type: 'fixed',
    port: 3000,
    api_url: '',
    type: 'PROD',
    match_making_url: '',
    server_game_ip: '',
    server_game_type: 'UDP',
    is_active: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (version && mode === 'edit') {
      setFormData(version)
    } else if (mode === 'create') {
      setFormData({
        game_version: '',
        description: '',
        port_type: 'fixed',
        port: 3000,
        api_url: '',
        type: 'PROD',
        match_making_url: '',
        server_game_ip: '',
        server_game_type: 'UDP',
        is_active: true
      })
    }
  }, [version, mode, open])

  const handleChange = (field: keyof GameVersionFormData, value: any) => {
    if (field === 'port' || field === 'port_start' || field === 'port_end') {
      setFormData(prev => ({ ...prev, [field]: Number(value) }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
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
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-boxdark">
        <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            {mode === 'create' ? `Add New Version - ${gameName}` : `Edit Version - ${gameName}`}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bodydark mb-2">Game ID</label>
              <input
                type="text"
                value={gameId}
                disabled
                className="w-full rounded border border-stroke bg-gray py-3 px-4 text-black dark:bg-meta-4 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-bodydark mb-2">Version <span className="text-danger">*</span></label>
              <input
                type="text"
                value={formData.game_version}
                onChange={(e) => handleChange('game_version', e.target.value)}
                placeholder="1.0"
                className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-bodydark mb-2">Environment Type <span className="text-danger">*</span></label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
              >
                <option value="PROD">PROD</option>
                <option value="TEST">TEST</option>
                <option value="UAT">UAT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-bodydark mb-2">Protocol <span className="text-danger">*</span></label>
              <select
                value={formData.server_game_type}
                onChange={(e) => handleChange('server_game_type', e.target.value)}
                className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
              >
                <option value="UDP">UDP</option>
                <option value="TCP">TCP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">Description <span className="text-danger">*</span></label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
              className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">Server IP <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.server_game_ip}
              onChange={(e) => handleChange('server_game_ip', e.target.value)}
              placeholder="192.168.1.100"
              className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">Port Configuration <span className="text-danger">*</span></label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="port_type"
                    value="fixed"
                    checked={formData.port_type === 'fixed'}
                    onChange={(e) => handleChange('port_type', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-black dark:text-white">Fixed Port</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="port_type"
                    value="range"
                    checked={formData.port_type === 'range'}
                    onChange={(e) => handleChange('port_type', e.target.value)}
                    className="h-4 w-4"
                  />
                  <span className="text-black dark:text-white">Port Range</span>
                </label>
              </div>

              {formData.port_type === 'fixed' ? (
                <input
                  type="number"
                  value={formData.port || ''}
                  onChange={(e) => handleChange('port', e.target.value)}
                  placeholder="3000"
                  className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-bodydark mb-1">Start Port</label>
                    <input
                      type="number"
                      value={formData.port_start || ''}
                      onChange={(e) => handleChange('port_start', e.target.value)}
                      placeholder="3000"
                      className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-bodydark mb-1">End Port</label>
                    <input
                      type="number"
                      value={formData.port_end || ''}
                      onChange={(e) => handleChange('port_end', e.target.value)}
                      placeholder="3010"
                      className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">API URL <span className="text-danger">*</span></label>
            <input
              type="text"
              value={formData.api_url}
              onChange={(e) => handleChange('api_url', e.target.value)}
              placeholder="https://api-prod.example.com/game"
              className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">Matchmaking URL <span className="text-bodydark text-xs">(Optional)</span></label>
            <input
              type="text"
              value={formData.match_making_url || ''}
              onChange={(e) => handleChange('match_making_url', e.target.value)}
              placeholder="https://matchmaking.example.com/game"
              className="w-full rounded border border-stroke bg-transparent py-3 px-4 text-black dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-bodydark mb-2">Status</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_active"
                  checked={formData.is_active === true}
                  onChange={() => handleChange('is_active', true)}
                  className="h-4 w-4"
                />
                <span className="text-black dark:text-white">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_active"
                  checked={formData.is_active === false}
                  onChange={() => handleChange('is_active', false)}
                  className="h-4 w-4"
                />
                <span className="text-black dark:text-white">Inactive</span>
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-stroke px-6 py-4 dark:border-strokedark flex justify-end gap-3">
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
            {loading ? 'Saving...' : mode === 'create' ? 'Create Version' : 'Update Version'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameVersionForm

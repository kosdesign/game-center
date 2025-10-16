import { useState, useEffect } from 'react'
import { HiPlus, HiPencil, HiTrash, HiEye, HiClipboardCopy } from 'react-icons/hi'
import toast from 'react-hot-toast'
import DefaultLayout from '../layouts/DefaultLayout'
import gameParentService, { GameParent } from '../services/gameParent.service'
import gameVersionService, { GameVersion } from '../services/gameVersion.service'
import GameParentForm from '../components/GameParentForm'
import GameVersionForm from '../components/GameVersionForm'
import { useUrlStatus } from '../hooks/useUrlStatus'
import { useAuth } from '../hooks/useAuth'
import { env } from '../config/env'

const TailDashboard = () => {
  const { user } = useAuth()
  const [games, setGames] = useState<GameParent[]>([])
  const [selectedGame, setSelectedGame] = useState<GameParent | null>(null)
  const [versions, setVersions] = useState<GameVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [versionsLoading, setVersionsLoading] = useState(false)

  const [typeFilter, setTypeFilter] = useState<string>('')
  const [protocolFilter, setProtocolFilter] = useState<string>('')

  const [deleteGameDialog, setDeleteGameDialog] = useState(false)
  const [deleteVersionDialog, setDeleteVersionDialog] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<string | null>(null)
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null)

  const [gameFormOpen, setGameFormOpen] = useState(false)
  const [gameFormMode, setGameFormMode] = useState<'create' | 'edit'>('create')
  const [editingGame, setEditingGame] = useState<GameParent | null>(null)

  const [versionFormOpen, setVersionFormOpen] = useState(false)
  const [versionFormMode, setVersionFormMode] = useState<'create' | 'edit'>('create')
  const [editingVersion, setEditingVersion] = useState<GameVersion | null>(null)

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailVersion, setDetailVersion] = useState<GameVersion | null>(null)
  const [apiDocsOpen, setApiDocsOpen] = useState(false)

  // Filter versions based on selected filters and sort by version number descending
  const filteredVersions = versions
    .filter(version => {
      if (typeFilter && version.type !== typeFilter) return false
      if (protocolFilter && version.server_game_type !== protocolFilter) return false
      return true
    })
    .sort((a, b) => {
      // Sort by version number descending (newest version first)
      // Parse semantic version (e.g., "1.2.3" -> [1, 2, 3])
      const parseVersion = (v: string) => {
        return v.split('.').map(num => parseInt(num) || 0)
      }

      const versionA = parseVersion(a.game_version)
      const versionB = parseVersion(b.game_version)

      // Compare each segment
      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const numA = versionA[i] || 0
        const numB = versionB[i] || 0
        if (numB !== numA) {
          return numB - numA
        }
      }
      return 0
    })

  // Collect all URLs from filtered versions for status checking
  const allUrls = filteredVersions.flatMap(v => [v.api_url, v.match_making_url].filter(Boolean) as string[])
  const urlStatuses = useUrlStatus(allUrls)

  const getStatusIcon = (url: string) => {
    const statusInfo = urlStatuses[url]

    if (!statusInfo) {
      return <span className="inline-flex h-3 w-3 rounded-full bg-bodydark" title="Unknown"></span>
    }

    if (statusInfo.status === 'checking') {
      return (
        <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-warning" title="Checking..."></span>
      )
    } else if (statusInfo.status === 'online') {
      const title = statusInfo.statusCode
        ? `${statusInfo.statusCode} ${statusInfo.statusText || ''}`
        : 'Online'
      return (
        <span className="inline-flex h-3 w-3 rounded-full bg-success" title={title}></span>
      )
    } else {
      const title = statusInfo.statusCode
        ? `${statusInfo.statusCode} ${statusInfo.statusText || ''}`
        : statusInfo.statusText || 'Offline'
      return (
        <span className="inline-flex h-3 w-3 rounded-full bg-danger" title={title}></span>
      )
    }
  }

  const getPortDisplay = (version: GameVersion) => {
    if (version.port_type === 'range') {
      return `${version.port_start} - ${version.port_end}`
    }
    return version.port?.toString() || '-'
  }

  const loadGames = async () => {
    try {
      setLoading(true)
      const data = await gameParentService.getAllGames()
      setGames(data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load games'
      toast.error(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const loadVersions = async (gameId: string) => {
    try {
      setVersionsLoading(true)
      const data = await gameVersionService.getVersionsByGameId(gameId)
      setVersions(data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load versions'
      toast.error(`Error: ${errorMsg}`)
    } finally {
      setVersionsLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  useEffect(() => {
    if (selectedGame) {
      loadVersions(selectedGame.game_id)
    }
  }, [selectedGame])

  const handleGameFormSubmit = async (data: { game_id: string; game_name: string }) => {
    try {
      if (gameFormMode === 'create') {
        const newGame = await gameParentService.createGame(data)
        setGames([...games, newGame])
        toast.success('Game created successfully!')
      } else if (editingGame) {
        const updated = await gameParentService.updateGame(editingGame.game_id, {
          game_name: data.game_name
        })
        setGames(games.map(g => g.game_id === editingGame.game_id ? updated : g))
        if (selectedGame?.game_id === editingGame.game_id) {
          setSelectedGame(updated)
        }
        toast.success('Game updated successfully!')
      }
      setGameFormOpen(false)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${gameFormMode} game`
      toast.error(`Error: ${errorMsg}`)
      throw err
    }
  }

  const handleVersionFormSubmit = async (data: any) => {
    if (!selectedGame) return

    try {
      if (versionFormMode === 'create') {
        const newVersion = await gameVersionService.createVersion(selectedGame.game_id, data)
        setVersions([...versions, newVersion])
        toast.success('Version created successfully!')
      } else if (editingVersion) {
        const updated = await gameVersionService.updateVersion(
          selectedGame.game_id,
          editingVersion.game_version,
          data
        )
        setVersions(versions.map(v =>
          v.game_version === editingVersion.game_version ? updated : v
        ))
        toast.success('Version updated successfully!')
      }
      setVersionFormOpen(false)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || `Failed to ${versionFormMode} version`
      toast.error(`Error: ${errorMsg}`)
      throw err
    }
  }

  const handleDeleteGameConfirm = async () => {
    if (!gameToDelete) return

    try {
      await gameParentService.deleteGame(gameToDelete)
      setGames(games.filter(g => g.game_id !== gameToDelete))
      if (selectedGame?.game_id === gameToDelete) {
        setSelectedGame(null)
        setVersions([])
      }
      setDeleteGameDialog(false)
      setGameToDelete(null)
      toast.success('Game deleted successfully!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete game'
      toast.error(`Error: ${errorMsg}`)
    }
  }

  const handleDeleteVersionConfirm = async () => {
    if (!selectedGame || !versionToDelete) return

    try {
      await gameVersionService.deleteVersion(selectedGame.game_id, versionToDelete)
      setVersions(versions.filter(v => v.game_version !== versionToDelete))
      setDeleteVersionDialog(false)
      setVersionToDelete(null)
      toast.success('Version deleted successfully!')
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to delete version'
      toast.error(`Error: ${errorMsg}`)
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      PROD: 'bg-success text-black',
      TEST: 'bg-warning text-black',
      UAT: 'bg-meta-5 text-black'
    }
    return colors[type as keyof typeof colors] || 'bg-gray text-black'
  }

  return (
    <DefaultLayout>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        {/* Games List */}
        <div className="col-span-12 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
              <h3 className="font-medium text-black dark:text-white">Games</h3>
              <button
                onClick={() => {
                  setGameFormMode('create')
                  setEditingGame(null)
                  setGameFormOpen(true)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 transition"
              >
                <HiPlus className="text-lg" />
                <span className="hidden sm:inline">Add Game</span>
              </button>
            </div>

            <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-10 text-bodydark">No games found</div>
              ) : (
                <div className="space-y-3">
                  {games.map((game) => (
                    <div
                      key={game.game_id}
                      onClick={() => setSelectedGame(game)}
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        selectedGame?.game_id === game.game_id
                          ? 'border-primary bg-gray-2 dark:bg-meta-4'
                          : 'border-stroke hover:border-primary dark:border-strokedark'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-black dark:text-white mb-1">
                            {game.game_name}
                          </h4>
                          <p className="text-sm text-bodydark">ID: {game.game_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setGameFormMode('edit')
                              setEditingGame(game)
                              setGameFormOpen(true)
                            }}
                            className="text-primary hover:text-opacity-70"
                          >
                            <HiPencil className="text-lg" />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setGameToDelete(game.game_id)
                                setDeleteGameDialog(true)
                              }}
                              className="text-meta-1 hover:text-opacity-70"
                            >
                              <HiTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Versions Table */}
        <div className="col-span-12 xl:col-span-9">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
              <h3 className="font-medium text-black dark:text-white">
                {selectedGame ? `Versions - ${selectedGame.game_name}` : 'Select a Game'}
              </h3>
              {selectedGame && (
                <button
                  onClick={() => {
                    setVersionFormMode('create')
                    setEditingVersion(null)
                    setVersionFormOpen(true)
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 transition"
                >
                  <HiPlus className="text-lg" />
                  Add Version
                </button>
              )}
            </div>

            {selectedGame && (
              <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-bodydark">Type:</label>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="rounded border-[1.5px] border-stroke bg-white py-2 px-3 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="">All</option>
                        <option value="PROD">PROD</option>
                        <option value="TEST">TEST</option>
                        <option value="UAT">UAT</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-bodydark">Protocol:</label>
                      <select
                        value={protocolFilter}
                        onChange={(e) => setProtocolFilter(e.target.value)}
                        className="rounded border-[1.5px] border-stroke bg-white py-2 px-3 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="">All</option>
                        <option value="UDP">UDP</option>
                        <option value="TCP">TCP</option>
                      </select>
                    </div>

                    {(typeFilter || protocolFilter) && (
                      <button
                        onClick={() => {
                          setTypeFilter('')
                          setProtocolFilter('')
                        }}
                        className="text-sm text-primary hover:text-opacity-70"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-bodydark mb-1">API Token</label>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white dark:bg-boxdark px-3 py-2 rounded border border-stroke dark:border-strokedark font-mono text-black dark:text-white">
                          {selectedGame.api_token}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedGame.api_token)
                            toast.success('API Token copied to clipboard!')
                          }}
                          className="text-primary hover:text-opacity-70 text-sm"
                          title="Copy to clipboard"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-bodydark">Game ID: <span className="font-mono text-black dark:text-white">{selectedGame.game_id}</span></p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-boxdark rounded border border-stroke dark:border-strokedark">
                    <button
                      onClick={() => setApiDocsOpen(!apiDocsOpen)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors"
                    >
                      <h4 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Open API Documentation
                      </h4>
                      <svg
                        className={`w-5 h-5 text-bodydark transition-transform ${apiDocsOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {apiDocsOpen && (
                      <div className="p-4 pt-0 space-y-3 border-t border-stroke dark:border-strokedark">
                      <div>
                        <label className="block text-xs font-medium text-bodydark mb-1">Endpoint</label>
                        <code className="block text-xs bg-gray-2 dark:bg-meta-4 px-3 py-2 rounded font-mono text-black dark:text-white">
                          POST {env.apiUrl}/api/game/info
                        </code>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-bodydark mb-1">Headers</label>
                        <code className="block text-xs bg-gray-2 dark:bg-meta-4 px-3 py-2 rounded font-mono text-black dark:text-white whitespace-pre-wrap">
                          {`Authorization: Bearer ${selectedGame.api_token}`}
                        </code>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-bodydark mb-1">Request Body</label>
                        <code className="block text-xs bg-gray-2 dark:bg-meta-4 px-3 py-2 rounded font-mono text-black dark:text-white whitespace-pre-wrap">
                          {`{
  "version_id": "version_id_here"
}`}
                        </code>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-bodydark mb-1">Response Example</label>
                        <code className="block text-xs bg-gray-2 dark:bg-meta-4 px-3 py-2 rounded font-mono text-black dark:text-white whitespace-pre-wrap overflow-x-auto max-h-40">
                          {`{
  "success": true,
  "data": {
    "version_id": "675771c39af62d4930f6c3c9",
    "game_id": "${selectedGame.game_id}",
    "game_version": "1.0",
    "description": "Game description",
    "port_type": "fixed",
    "port": 3000,
    "api_url": "https://api.example.com",
    "type": "PROD",
    "match_making_url": "https://mm.example.com",
    "server_game_ip": "192.168.1.100",
    "server_game_type": "UDP",
    "is_active": true
  },
  "timestamp": "2025-01-10T10:00:00.000Z"
}`}
                        </code>
                      </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4">
              {!selectedGame ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <HiEye className="text-6xl text-bodydark mb-4" />
                  <p className="text-bodydark text-lg">Select a game to view versions</p>
                </div>
              ) : versionsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-2 text-left dark:bg-meta-4">
                        <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Version</th>
                        <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white">Type</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Server IP</th>
                        <th className="min-w-[70px] py-4 px-4 font-medium text-black dark:text-white">Port</th>
                        <th className="min-w-[90px] py-4 px-4 font-medium text-black dark:text-white">Protocol</th>
                        <th className="min-w-[180px] py-4 px-4 font-medium text-black dark:text-white">API URL</th>
                        <th className="min-w-[180px] py-4 px-4 font-medium text-black dark:text-white">Matchmaking URL</th>
                        <th className="min-w-[90px] py-4 px-4 font-medium text-black dark:text-white">Status</th>
                        <th className="py-4 px-4 font-medium text-black dark:text-white text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVersions.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="text-center py-10 text-bodydark">
                            {versions.length === 0 ? 'No versions found' : 'No versions match the selected filters'}
                          </td>
                        </tr>
                      ) : (
                        filteredVersions.map((version) => (
                          <tr key={version.game_version} className="border-b border-stroke dark:border-strokedark">
                            <td className="py-5 px-4">
                              <p className="text-black dark:text-white font-medium">{version.game_version}</p>
                            </td>
                            <td className="py-5 px-4">
                              <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${getTypeBadge(version.type)}`}>
                                {version.type}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <p className="text-black dark:text-white text-sm">{version.server_game_ip}</p>
                            </td>
                            <td className="py-5 px-4">
                              <p className="text-black dark:text-white">{getPortDisplay(version)}</p>
                            </td>
                            <td className="py-5 px-4">
                              <span className="inline-flex rounded bg-meta-3 bg-opacity-10 py-1 px-2 text-sm font-medium text-meta-3">
                                {version.server_game_type}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(version.api_url)}
                                <p className="text-black dark:text-white text-sm truncate max-w-[150px]" title={version.api_url}>
                                  {version.api_url}
                                </p>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(version.api_url)
                                    toast.success('API URL copied to clipboard!')
                                  }}
                                  className="text-bodydark hover:text-primary transition-colors"
                                  title="Copy URL"
                                >
                                  <HiClipboardCopy className="text-base" />
                                </button>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              {version.match_making_url ? (
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(version.match_making_url)}
                                  <p className="text-black dark:text-white text-sm truncate max-w-[150px]" title={version.match_making_url}>
                                    {version.match_making_url}
                                  </p>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(version.match_making_url!)
                                      toast.success('Matchmaking URL copied to clipboard!')
                                    }}
                                    className="text-bodydark hover:text-primary transition-colors"
                                    title="Copy URL"
                                  >
                                    <HiClipboardCopy className="text-base" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-bodydark text-sm italic">Not set</span>
                              )}
                            </td>
                            <td className="py-5 px-4">
                              <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                                version.is_active
                                  ? 'bg-success bg-opacity-10 text-success'
                                  : 'bg-danger bg-opacity-10 text-danger'
                              }`}>
                                {version.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="py-5 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setDetailVersion(version)
                                    setDetailModalOpen(true)
                                  }}
                                  className="text-meta-5 hover:text-opacity-70"
                                  title="View Details"
                                >
                                  <HiEye className="text-xl" />
                                </button>
                                <button
                                  onClick={() => {
                                    setVersionFormMode('edit')
                                    setEditingVersion(version)
                                    setVersionFormOpen(true)
                                  }}
                                  className="text-primary hover:text-opacity-70"
                                  title="Edit"
                                >
                                  <HiPencil className="text-lg" />
                                </button>
                                <button
                                  onClick={() => {
                                    setVersionToDelete(version.game_version)
                                    setDeleteVersionDialog(true)
                                  }}
                                  className="text-meta-1 hover:text-opacity-70"
                                  title="Delete"
                                >
                                  <HiTrash className="text-lg" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialogs */}
      {deleteGameDialog && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Confirm Delete Game</h3>
            <p className="mb-6 text-bodydark">Are you sure you want to delete this game? All versions will be deleted. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteGameDialog(false)}
                className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGameConfirm}
                className="rounded bg-meta-1 py-2 px-4 text-white hover:bg-opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteVersionDialog && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Confirm Delete Version</h3>
            <p className="mb-6 text-bodydark">Are you sure you want to delete this version? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteVersionDialog(false)}
                className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVersionConfirm}
                className="rounded bg-meta-1 py-2 px-4 text-white hover:bg-opacity-90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && detailVersion && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white dark:bg-boxdark">
            <div className="border-b border-stroke px-6 py-4 dark:border-strokedark flex justify-between items-center">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                Version Details - {detailVersion.game_version}
              </h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-bodydark hover:text-black dark:hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Game Version</label>
                  <p className="text-black dark:text-white font-semibold">{detailVersion.game_version}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Type</label>
                  <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${getTypeBadge(detailVersion.type)}`}>
                    {detailVersion.type}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bodydark mb-1">Description</label>
                <p className="text-black dark:text-white bg-gray-2 dark:bg-meta-4 p-3 rounded">{detailVersion.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Server IP</label>
                  <p className="text-black dark:text-white">{detailVersion.server_game_ip}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">
                    Port {detailVersion.port_type === 'range' ? '(Range)' : '(Fixed)'}
                  </label>
                  <p className="text-black dark:text-white font-medium">{getPortDisplay(detailVersion)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Protocol</label>
                  <span className="inline-flex rounded bg-meta-3 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-3">
                    {detailVersion.server_game_type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Status</label>
                  <span className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                    detailVersion.is_active
                      ? 'bg-success bg-opacity-10 text-success'
                      : 'bg-danger bg-opacity-10 text-danger'
                  }`}>
                    {detailVersion.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bodydark mb-1">API URL</label>
                <div className="flex items-start gap-2 bg-gray-2 dark:bg-meta-4 p-2 rounded">
                  <div className="pt-1">{getStatusIcon(detailVersion.api_url)}</div>
                  <p className="text-black dark:text-white break-all text-sm flex-1">
                    {detailVersion.api_url}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bodydark mb-1">Matchmaking URL</label>
                {detailVersion.match_making_url ? (
                  <div className="flex items-start gap-2 bg-gray-2 dark:bg-meta-4 p-2 rounded">
                    <div className="pt-1">{getStatusIcon(detailVersion.match_making_url)}</div>
                    <p className="text-black dark:text-white break-all text-sm flex-1">
                      {detailVersion.match_making_url}
                    </p>
                  </div>
                ) : (
                  <p className="text-bodydark bg-gray-2 dark:bg-meta-4 p-2 rounded text-sm italic">
                    Not configured
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Created At</label>
                  <p className="text-black dark:text-white text-sm">
                    {new Date(detailVersion.created_at).toLocaleString('th-TH')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-bodydark mb-1">Updated At</label>
                  <p className="text-black dark:text-white text-sm">
                    {new Date(detailVersion.updated_at).toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-stroke px-6 py-4 dark:border-strokedark flex justify-end gap-3">
              <button
                onClick={() => {
                  setDetailModalOpen(false)
                  setVersionFormMode('edit')
                  setEditingVersion(detailVersion)
                  setVersionFormOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90"
              >
                <HiPencil />
                Edit
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      <GameParentForm
        open={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
        onSubmit={handleGameFormSubmit}
        game={editingGame}
        mode={gameFormMode}
      />

      {selectedGame && (
        <GameVersionForm
          open={versionFormOpen}
          onClose={() => setVersionFormOpen(false)}
          onSubmit={handleVersionFormSubmit}
          version={editingVersion}
          mode={versionFormMode}
          gameId={selectedGame.game_id}
          gameName={selectedGame.game_name}
        />
      )}
    </DefaultLayout>
  )
}

export default TailDashboard

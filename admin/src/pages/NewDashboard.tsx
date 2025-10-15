import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { Edit, Delete, Add, Logout, Visibility } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import gameParentService, { GameParent } from '../services/gameParent.service'
import gameVersionService, { GameVersion } from '../services/gameVersion.service'
import GameParentForm from '../components/GameParentForm'
import GameVersionForm from '../components/GameVersionForm'

const NewDashboard = () => {
  const [games, setGames] = useState<GameParent[]>([])
  const [selectedGame, setSelectedGame] = useState<GameParent | null>(null)
  const [versions, setVersions] = useState<GameVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const loadGames = async () => {
    try {
      setLoading(true)
      const data = await gameParentService.getAllGames()
      setGames(data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load games')
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
      setError(err.message || 'Failed to load versions')
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleAddGameClick = () => {
    setGameFormMode('create')
    setEditingGame(null)
    setGameFormOpen(true)
  }

  const handleEditGameClick = (game: GameParent) => {
    setGameFormMode('edit')
    setEditingGame(game)
    setGameFormOpen(true)
  }

  const handleDeleteGameClick = (gameId: string) => {
    setGameToDelete(gameId)
    setDeleteGameDialog(true)
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
      setSuccess('Game deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete game')
    }
  }

  const handleGameFormSubmit = async (data: { game_id: string; game_name: string }) => {
    try {
      if (gameFormMode === 'create') {
        const newGame = await gameParentService.createGame(data)
        setGames([...games, newGame])
        setSuccess('Game created successfully')
      } else if (editingGame) {
        const updated = await gameParentService.updateGame(editingGame.game_id, {
          game_name: data.game_name
        })
        setGames(games.map(g => g.game_id === editingGame.game_id ? updated : g))
        if (selectedGame?.game_id === editingGame.game_id) {
          setSelectedGame(updated)
        }
        setSuccess('Game updated successfully')
      }
      setGameFormOpen(false)
    } catch (err: any) {
      setError(err.message || `Failed to ${gameFormMode} game`)
      throw err
    }
  }

  const handleAddVersionClick = () => {
    if (!selectedGame) return
    setVersionFormMode('create')
    setEditingVersion(null)
    setVersionFormOpen(true)
  }

  const handleEditVersionClick = (version: GameVersion) => {
    setVersionFormMode('edit')
    setEditingVersion(version)
    setVersionFormOpen(true)
  }

  const handleDeleteVersionClick = (version: string) => {
    setVersionToDelete(version)
    setDeleteVersionDialog(true)
  }

  const handleDeleteVersionConfirm = async () => {
    if (!selectedGame || !versionToDelete) return

    try {
      await gameVersionService.deleteVersion(selectedGame.game_id, versionToDelete)
      setVersions(versions.filter(v => v.game_version !== versionToDelete))
      setDeleteVersionDialog(false)
      setVersionToDelete(null)
      setSuccess('Version deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete version')
    }
  }

  const handleVersionFormSubmit = async (data: any) => {
    if (!selectedGame) return

    try {
      if (versionFormMode === 'create') {
        const newVersion = await gameVersionService.createVersion(selectedGame.game_id, data)
        setVersions([...versions, newVersion])
        setSuccess('Version created successfully')
      } else if (editingVersion) {
        const updated = await gameVersionService.updateVersion(
          selectedGame.game_id,
          editingVersion.game_version,
          data
        )
        setVersions(versions.map(v =>
          v.game_version === editingVersion.game_version ? updated : v
        ))
        setSuccess('Version updated successfully')
      }
      setVersionFormOpen(false)
    } catch (err: any) {
      setError(err.message || `Failed to ${versionFormMode} version`)
      throw err
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PROD': return 'success'
      case 'TEST': return 'warning'
      case 'UAT': return 'info'
      default: return 'default'
    }
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Game Center Admin
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.username}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Games List */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Games</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={handleAddGameClick}
              >
                Add Game
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Paper sx={{ maxHeight: '70vh', overflow: 'auto' }}>
                {games.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No games found</Typography>
                  </Box>
                ) : (
                  games.map((game) => (
                    <Card
                      key={game.game_id}
                      sx={{
                        m: 1,
                        cursor: 'pointer',
                        bgcolor: selectedGame?.game_id === game.game_id ? 'action.selected' : 'background.paper'
                      }}
                      onClick={() => setSelectedGame(game)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box>
                            <Typography variant="h6">{game.game_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {game.game_id}
                            </Typography>
                          </Box>
                          <Box>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditGameClick(game)
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteGameClick(game.game_id)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Paper>
            )}
          </Grid>

          {/* Versions List */}
          <Grid item xs={12} md={8}>
            {selectedGame ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h5">
                    Versions - {selectedGame.game_name}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleAddVersionClick}
                  >
                    Add Version
                  </Button>
                </Box>

                {versionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Version</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Server IP</TableCell>
                          <TableCell>Port</TableCell>
                          <TableCell>Protocol</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {versions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              No versions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          versions.map((version) => (
                            <TableRow key={version.game_version}>
                              <TableCell>{version.game_version}</TableCell>
                              <TableCell>
                                <Chip
                                  label={version.type}
                                  color={getTypeColor(version.type)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>{version.description}</TableCell>
                              <TableCell>{version.server_game_ip}</TableCell>
                              <TableCell>{version.port}</TableCell>
                              <TableCell>{version.server_game_type}</TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditVersionClick(version)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteVersionClick(version.game_version)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Visibility sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Select a game to view versions
                  </Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Delete Game Dialog */}
      <Dialog open={deleteGameDialog} onClose={() => setDeleteGameDialog(false)}>
        <DialogTitle>Confirm Delete Game</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this game? All versions will be deleted. This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteGameDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteGameConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Version Dialog */}
      <Dialog open={deleteVersionDialog} onClose={() => setDeleteVersionDialog(false)}>
        <DialogTitle>Confirm Delete Version</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this version? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVersionDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteVersionConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Game Form */}
      <GameParentForm
        open={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
        onSubmit={handleGameFormSubmit}
        game={editingGame}
        mode={gameFormMode}
      />

      {/* Version Form */}
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

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </>
  )
}

export default NewDashboard

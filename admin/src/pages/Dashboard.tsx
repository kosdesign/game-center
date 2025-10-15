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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material'
import { Edit, Delete, Add, Logout } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import gameService from '../services/game.service'
import { Game, CreateGameRequest, UpdateGameRequest } from '@shared/types'
import GameForm from '../components/GameForm'

const Dashboard = () => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [gameToDelete, setGameToDelete] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const loadGames = async () => {
    try {
      setLoading(true)
      const data = await gameService.getAllGames()
      setGames(data)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load games')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGames()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDeleteClick = (gameId: string) => {
    setGameToDelete(gameId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return

    try {
      await gameService.deleteGame(gameToDelete)
      setGames(games.filter(g => g.game_id !== gameToDelete))
      setDeleteDialogOpen(false)
      setGameToDelete(null)
      setSuccess('Game deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete game')
    }
  }

  const handleAddClick = () => {
    setFormMode('create')
    setSelectedGame(null)
    setFormOpen(true)
  }

  const handleEditClick = (game: Game) => {
    setFormMode('edit')
    setSelectedGame(game)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: CreateGameRequest | UpdateGameRequest) => {
    try {
      if (formMode === 'create') {
        const newGame = await gameService.createGame(data as CreateGameRequest)
        setGames([...games, newGame])
        setSuccess('Game created successfully')
      } else if (selectedGame) {
        const updatedGame = await gameService.updateGame(
          selectedGame.game_id,
          selectedGame.game_version,
          data as UpdateGameRequest
        )
        setGames(games.map(g =>
          g.game_id === selectedGame.game_id && g.game_version === selectedGame.game_version
            ? updatedGame
            : g
        ))
        setSuccess('Game updated successfully')
      }
      setFormOpen(false)
    } catch (err: any) {
      setError(err.message || `Failed to ${formMode} game`)
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

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Games Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
          >
            Add Game
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game ID</TableCell>
                  <TableCell>Game Name</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Server IP</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Protocol</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {games.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No games found
                    </TableCell>
                  </TableRow>
                ) : (
                  games.map((game) => (
                    <TableRow key={`${game.game_id}-${game.game_version}`}>
                      <TableCell>{game.game_id}</TableCell>
                      <TableCell>{game.game_name}</TableCell>
                      <TableCell>{game.game_version}</TableCell>
                      <TableCell>
                        <Chip
                          label={game.type}
                          color={getTypeColor(game.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{game.server_game_ip}</TableCell>
                      <TableCell>{game.port}</TableCell>
                      <TableCell>{game.server_game_type}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEditClick(game)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(game.game_id)}
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
      </Container>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this game? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <GameForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        game={selectedGame}
        mode={formMode}
      />

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </>
  )
}

export default Dashboard

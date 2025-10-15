import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material'
import { Game, CreateGameRequest, UpdateGameRequest } from '@shared/types'

interface GameFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateGameRequest | UpdateGameRequest) => Promise<void>
  game?: Game | null
  mode: 'create' | 'edit'
}

const GameForm = ({ open, onClose, onSubmit, game, mode }: GameFormProps) => {
  const [formData, setFormData] = useState<CreateGameRequest>({
    game_id: '',
    game_name: '',
    game_version: '',
    description: '',
    port: 3000,
    api_url: '',
    type: 'PROD',
    match_making_url: '',
    server_game_ip: '',
    server_game_type: 'UDP'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (game && mode === 'edit') {
      setFormData({
        game_id: game.game_id,
        game_name: game.game_name,
        game_version: game.game_version,
        description: game.description,
        port: game.port,
        api_url: game.api_url,
        type: game.type,
        match_making_url: game.match_making_url,
        server_game_ip: game.server_game_ip,
        server_game_type: game.server_game_type
      })
    } else if (mode === 'create') {
      setFormData({
        game_id: '',
        game_name: '',
        game_version: '',
        description: '',
        port: 3000,
        api_url: '',
        type: 'PROD',
        match_making_url: '',
        server_game_ip: '',
        server_game_type: 'UDP'
      })
    }
  }, [game, mode, open])

  const handleChange = (field: keyof CreateGameRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = field === 'port' ? Number(e.target.value) : e.target.value
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add New Game' : 'Edit Game'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Game ID"
              value={formData.game_id}
              onChange={handleChange('game_id')}
              disabled={mode === 'edit'}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Game Name"
              value={formData.game_name}
              onChange={handleChange('game_name')}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Version"
              value={formData.game_version}
              onChange={handleChange('game_version')}
              required
              placeholder="1.0"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={handleChange('type')}
              >
                <MenuItem value="PROD">PROD</MenuItem>
                <MenuItem value="TEST">TEST</MenuItem>
                <MenuItem value="UAT">UAT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={2}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Server IP"
              value={formData.server_game_ip}
              onChange={handleChange('server_game_ip')}
              required
              placeholder="192.168.1.100"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Port"
              type="number"
              value={formData.port}
              onChange={handleChange('port')}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth required>
              <InputLabel>Protocol</InputLabel>
              <Select
                value={formData.server_game_type}
                label="Protocol"
                onChange={handleChange('server_game_type')}
              >
                <MenuItem value="UDP">UDP</MenuItem>
                <MenuItem value="TCP">TCP</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API URL"
              value={formData.api_url}
              onChange={handleChange('api_url')}
              required
              placeholder="https://api-prod.example.com/game"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Matchmaking URL"
              value={formData.match_making_url}
              onChange={handleChange('match_making_url')}
              required
              placeholder="https://matchmaking.example.com/game"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GameForm

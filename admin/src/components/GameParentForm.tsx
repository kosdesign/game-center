import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid
} from '@mui/material'

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

  const handleChange = (field: keyof GameParentFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add New Game' : 'Edit Game'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Game ID"
              value={formData.game_id}
              onChange={handleChange('game_id')}
              disabled={mode === 'edit'}
              required
              helperText="Unique identifier for the game"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Game Name"
              value={formData.game_name}
              onChange={handleChange('game_name')}
              required
              helperText="Display name of the game"
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

export default GameParentForm

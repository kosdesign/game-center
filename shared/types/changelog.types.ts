export interface VersionChangelog {
  _id?: string
  game_id: string
  game_version: string
  change_type: 'created' | 'updated' | 'deleted'
  changed_fields?: string[]
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  changed_by: string
  changed_at: Date
  change_description?: string
}

export interface VersionChangelogResponse {
  changelog: VersionChangelog[]
  total: number
}

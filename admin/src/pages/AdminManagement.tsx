import { useState, useEffect } from 'react'
import { adminService, AdminResponse } from '../services/admin.service'
import toast from 'react-hot-toast'
import DefaultLayout from '../layouts/DefaultLayout'
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi'

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminResponse | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const data = await adminService.getAdmins()
      setAdmins(data)
    } catch (error) {
      toast.error('Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      await adminService.deleteAdmin(adminId)
      toast.success('Admin deleted')
      fetchAdmins()
    } catch (error) {
      toast.error('Failed to delete admin')
    }
  }

  return (
    <DefaultLayout>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
          <h3 className="font-medium text-black dark:text-white">Admin Management</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 transition"
          >
            <HiPlus className="text-lg" />
            Create Admin
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Username</th>
                    <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">Role</th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Created</th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Last Login</th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-bodydark">
                        No admins found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.admin_id} className="border-b border-stroke dark:border-strokedark">
                        <td className="py-5 px-4">
                          <p className="text-black dark:text-white font-medium">{admin.username}</p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black dark:text-white">{admin.email}</p>
                        </td>
                        <td className="py-5 px-4">
                          <span className="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium bg-primary text-primary">
                            {admin.role}
                          </span>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black dark:text-white text-sm">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <p className="text-black dark:text-white text-sm">
                            {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : '-'}
                          </p>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setEditingAdmin(admin)}
                              className="text-primary hover:text-opacity-70"
                              title="Edit"
                            >
                              <HiPencil className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(admin.admin_id)}
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

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchAdmins()
          }}
        />
      )}

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSuccess={() => {
            setEditingAdmin(null)
            fetchAdmins()
          }}
        />
      )}
    </DefaultLayout>
  )
}

function CreateAdminModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adminService.createAdmin(formData)
      toast.success('Admin created successfully')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Create New Admin</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2.5 block text-black dark:text-white">Username *</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            >
              <option value="admin">Admin</option>
              <option value="dev">Developer</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditAdminModal({ admin, onClose, onSuccess }: { admin: AdminResponse; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    username: admin.username,
    email: admin.email,
    role: admin.role
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await adminService.updateAdmin(admin.admin_id, formData)
      toast.success('Admin updated successfully')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Edit Admin</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2.5 block text-black dark:text-white">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-2.5 block text-black dark:text-white">Role *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            >
              <option value="admin">Admin</option>
              <option value="dev">Developer</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray py-2 px-4 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

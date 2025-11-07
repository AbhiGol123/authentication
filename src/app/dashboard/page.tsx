'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type User = {
  id: string
  email: string
  created_at: string
  role?: string
}

type Role = {
  id: string
  name: string
  description: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session?.user) {
          router.push('/login')
          return
        }
        setUser(session.user)
        await Promise.all([fetchUsers(), fetchRoles()])
        setLoading(false)
      } catch (error) {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
    if (!error) setUsers(data || [])
  }

  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*').order('name', { ascending: true })
    if (!error) setRoles(data || [])
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) router.push('/login')
  }

  const handleAddUser = () => { setEditingUser(null); setShowUserModal(true) }
  const handleEditUser = (u: User) => { setEditingUser(u); setShowUserModal(true) }
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (!error) fetchUsers()
  }

  const handleAddRole = () => { setEditingRole(null); setShowRoleModal(true) }
  const handleEditRole = (r: Role) => { setEditingRole(r); setShowRoleModal(true) }
  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return
    const { error } = await supabase.from('roles').delete().eq('id', roleId)
    if (!error) fetchRoles()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">A</div>
              <span className="ml-3 text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                  {/* <span className="text-xs text-gray-500">Administrator</span> */}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="mt-2 text-lg text-gray-600">Manage your users and roles efficiently</p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-indigo-100">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Active Roles</h3>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Last Login</h3>
                <p className="text-2xl font-bold text-gray-900">Today</p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'roles'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Role Management
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'users' ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                  <button
                    onClick={handleAddUser}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Email</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{u.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            {u.role ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {u.role}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                No role
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button 
                              onClick={() => handleEditUser(u)} 
                              className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)} 
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by adding a new user.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
                  <button
                    onClick={handleAddRole}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Role
                  </button>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Users</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {roles.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{r.name}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{r.description || '-'}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {users.filter(u => u.role === r.name).length} users
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                          <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button 
                              onClick={() => handleEditRole(r)} 
                              className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteRole(r.id)} 
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {roles.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No roles</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating a new role.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          roles={roles}
          onClose={() => { setShowUserModal(false); setEditingUser(null) }}
          onSave={() => { setShowUserModal(false); setEditingUser(null); fetchUsers() }}
        />
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <RoleModal
          role={editingRole}
          onClose={() => { setShowRoleModal(false); setEditingRole(null) }}
          onSave={() => { setShowRoleModal(false); setEditingRole(null); fetchRoles() }}
        />
      )}
    </div>
  )
}

/* -------------------- User Modal -------------------- */
function UserModal({ user, roles, onClose, onSave }: { 
  user: User | null, roles: Role[], onClose: () => void, onSave: () => void 
}) {
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState(user?.role || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (user) {
        const { error } = await supabase.from('users').update({ email, role: role || null }).eq('id', user.id)
        if (error) setError(error.message); else onSave()
      } else {
        const { error } = await supabase.from('users').insert({ email, role: role || null })
        if (error) setError(error.message); else onSave()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{user ? 'Edit User' : 'Add User'}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="role" value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              >
                <option value="">No role</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <button
              type="button" onClick={onClose}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* -------------------- Role Modal -------------------- */
function RoleModal({ role, onClose, onSave }: { 
  role: Role | null, onClose: () => void, onSave: () => void 
}) {
  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (role) {
        const { error } = await supabase.from('roles').update({ name, description }).eq('id', role.id)
        if (error) setError(error.message); else onSave()
      } else {
        const { error } = await supabase.from('roles').insert({ name, description })
        if (error) setError(error.message); else onSave()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all duration-300 scale-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{role ? 'Edit Role' : 'Add Role'}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <button
              type="button" onClick={onClose}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 transition-all duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}




// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// /** Local types (not exported) */
// type TUser = {
//   id: string;
//   email: string;
//   created_at: string;
//   role?: string;
// };

// type TRole = {
//   id: string;
//   name: string;
//   description: string;
//   created_at: string;
// };

// export default function Page() {
//   const router = useRouter();

//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<"users" | "roles">("users");
//   const [users, setUsers] = useState<TUser[]>([]);
//   const [roles, setRoles] = useState<TRole[]>([]);
//   const [showUserModal, setShowUserModal] = useState(false);
//   const [showRoleModal, setShowRoleModal] = useState(false);
//   const [editingUser, setEditingUser] = useState<TUser | null>(null);
//   const [editingRole, setEditingRole] = useState<TRole | null>(null);

//   useEffect(() => {
//     const checkUser = async () => {
//       const {
//         data: { session },
//         error,
//       } = await supabase.auth.getSession();

//       if (error || !session?.user) {
//         router.push("/login");
//         return;
//       }
//       setUser(session.user);
//       await Promise.all([fetchUsers(), fetchRoles()]);
//       setLoading(false);
//     };
//     checkUser();
//   }, [router]);

//   const fetchUsers = async () => {
//     const { data, error } = await supabase
//       .from("users")
//       .select("*")
//       .order("created_at", { ascending: false });
//     if (!error) setUsers(data || []);
//   };

//   const fetchRoles = async () => {
//     const { data, error } = await supabase
//       .from("roles")
//       .select("*")
//       .order("name", { ascending: true });
//     if (!error) setRoles(data || []);
//   };

//   const handleSignOut = async () => {
//     const { error } = await supabase.auth.signOut();
//     if (!error) router.push("/login");
//   };

//   const handleAddUser = () => {
//     setEditingUser(null);
//     setShowUserModal(true);
//   };
//   const handleEditUser = (u: TUser) => {
//     setEditingUser(u);
//     setShowUserModal(true);
//   };
//   const handleDeleteUser = async (userId: string) => {
//     if (!window.confirm("Are you sure you want to delete this user?")) return;
//     const { error } = await supabase.from("users").delete().eq("id", userId);
//     if (!error) fetchUsers();
//   };

//   const handleAddRole = () => {
//     setEditingRole(null);
//     setShowRoleModal(true);
//   };
//   const handleEditRole = (r: TRole) => {
//     setEditingRole(r);
//     setShowRoleModal(true);
//   };
//   const handleDeleteRole = async (roleId: string) => {
//     if (!window.confirm("Are you sure you want to delete this role?")) return;
//     const { error } = await supabase.from("roles").delete().eq("id", roleId);
//     if (!error) fetchRoles();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       {/* Top bar */}
//       <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="h-16 flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xl">
//                 A
//               </div>
//               <span className="ml-3 text-xl font-bold text-gray-900">
//                 Dashboard
//               </span>
//             </div>

//             <div className="flex items-center gap-4">
//               <div className="hidden md:flex items-center gap-3">
//                 <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-medium">
//                   {user?.email?.charAt(0).toUpperCase()}
//                 </div>
//                 <span className="text-sm font-medium text-gray-900">
//                   {user?.email}
//                 </span>
//               </div>
//               <button
//                 onClick={handleSignOut}
//                 className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
//               >
//                 Sign out
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main */}
//       <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
//           <p className="mt-2 text-lg text-gray-600">
//             Manage your users and roles
//           </p>
//         </div>

//         {/* Tabs wrapper card */}
//         <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
//           <div className="border-b border-gray-200">
//             <nav className="flex -mb-px">
//               <button
//                 onClick={() => setActiveTab("users")}
//                 className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
//                   activeTab === "users"
//                     ? "border-indigo-600 text-indigo-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 User Management
//               </button>
//               <button
//                 onClick={() => setActiveTab("roles")}
//                 className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${
//                   activeTab === "roles"
//                     ? "border-indigo-600 text-indigo-600"
//                     : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 Role Management
//               </button>
//             </nav>
//           </div>

//           <div className="p-6">
//             {activeTab === "users" ? (
//               <UsersTable
//                 users={users}
//                 onAdd={handleAddUser}
//                 onEdit={handleEditUser}
//                 onDelete={handleDeleteUser}
//               />
//             ) : (
//               <RolesTable
//                 roles={roles}
//                 users={users}
//                 onAdd={handleAddRole}
//                 onEdit={handleEditRole}
//                 onDelete={handleDeleteRole}
//               />
//             )}
//           </div>
//         </div>
//       </main>

//       {showUserModal && (
//         <UserModal
//           user={editingUser}
//           roles={roles}
//           onClose={() => {
//             setShowUserModal(false);
//             setEditingUser(null);
//           }}
//           onSave={() => {
//             setShowUserModal(false);
//             setEditingUser(null);
//             fetchUsers();
//           }}
//         />
//       )}

//       {showRoleModal && (
//         <RoleModal
//           role={editingRole}
//           onClose={() => {
//             setShowRoleModal(false);
//             setEditingRole(null);
//           }}
//           onSave={() => {
//             setShowRoleModal(false);
//             setEditingRole(null);
//             fetchRoles();
//           }}
//         />
//       )}
//     </div>
//   );
// }

// /* ---------- child components (not exported) ---------- */

// function UsersTable({
//   users,
//   onAdd,
//   onEdit,
//   onDelete,
// }: {
//   users: TUser[];
//   onAdd: () => void;
//   onEdit: (u: TUser) => void;
//   onDelete: (id: string) => void;
// }) {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-gray-900">Users</h2>
//         <button
//           onClick={onAdd}
//           className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//         >
//           Add User
//         </button>
//       </div>

//       <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
//                 Email
//               </th>
//               <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                 Role
//               </th>
//               <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                 Created
//               </th>
//               <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
//                 <span className="sr-only">Actions</span>
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {users.map((u) => (
//               <tr key={u.id} className="hover:bg-gray-50">
//                 <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
//                   {u.email}
//                 </td>
//                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
//                   {u.role || "No role"}
//                 </td>
//                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
//                   {new Date(u.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
//                   <button
//                     onClick={() => onEdit(u)}
//                     className="text-indigo-600 hover:text-indigo-900 mr-4"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => onDelete(u.id)}
//                     className="text-red-600 hover:text-red-900"
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {users.length === 0 && (
//               <tr>
//                 <td colSpan={4} className="py-8 text-center text-gray-500">
//                   No users yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function RolesTable({
//   roles,
//   users,
//   onAdd,
//   onEdit,
//   onDelete,
// }: {
//   roles: TRole[];
//   users: TUser[];
//   onAdd: () => void;
//   onEdit: (r: TRole) => void;
//   onDelete: (id: string) => void;
// }) {
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
//         <button
//           onClick={onAdd}
//           className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//         >
//           Add Role
//         </button>
//       </div>

//       <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
//                 Name
//               </th>
//               <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                 Description
//               </th>
//               <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                 Users
//               </th>
//               <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
//                 Created
//               </th>
//               <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
//                 <span className="sr-only">Actions</span>
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {roles.map((r) => (
//               <tr key={r.id} className="hover:bg-gray-50">
//                 <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
//                   {r.name}
//                 </td>
//                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
//                   {r.description || "-"}
//                 </td>
//                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
//                   {users.filter((u) => u.role === r.name).length} users
//                 </td>
//                 <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
//                   {new Date(r.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
//                   <button
//                     onClick={() => onEdit(r)}
//                     className="text-indigo-600 hover:text-indigo-900 mr-4"
//                   >
//                     Edit
//                   </button>
//                     <button
//                       onClick={() => onDelete(r.id)}
//                       className="text-red-600 hover:text-red-900"
//                     >
//                       Delete
//                     </button>
//                   </td>
//               </tr>
//             ))}
//             {roles.length === 0 && (
//               <tr>
//                 <td colSpan={5} className="py-8 text-center text-gray-500">
//                   No roles yet.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// /* -------------------- Modals (not exported) -------------------- */

// function UserModal({
//   user,
//   roles,
//   onClose,
//   onSave,
// }: {
//   user: TUser | null;
//   roles: TRole[];
//   onClose: () => void;
//   onSave: () => void;
// }) {
//   const [email, setEmail] = useState(user?.email || "");
//   const [role, setRole] = useState(user?.role || "");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       if (user) {
//         const { error } = await supabase
//           .from("users")
//           .update({ email, role: role || null })
//           .eq("id", user.id);
//         if (error) setError(error.message);
//         else onSave();
//       } else {
//         const { error } = await supabase
//           .from("users")
//           .insert({ email, role: role || null });
//         if (error) setError(error.message);
//         else onSave();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-900">
//             {user ? "Edit User" : "Add User"}
//           </h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="px-6 py-4 space-y-4">
//             {error && (
//               <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
//                 {error}
//               </div>
//             )}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 required
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Role
//               </label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               >
//                 <option value="">No role</option>
//                 {roles.map((r) => (
//                   <option key={r.id} value={r.name}>
//                     {r.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
//             >
//               {loading ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// function RoleModal({
//   role,
//   onClose,
//   onSave,
// }: {
//   role: TRole | null;
//   onClose: () => void;
//   onSave: () => void;
// }) {
//   const [name, setName] = useState(role?.name || "");
//   const [description, setDescription] = useState(role?.description || "");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       if (role) {
//         const { error } = await supabase
//           .from("roles")
//           .update({ name, description })
//           .eq("id", role.id);
//         if (error) setError(error.message);
//         else onSave();
//       } else {
//         const { error } = await supabase
//           .from("roles")
//           .insert({ name, description });
//         if (error) setError(error.message);
//         else onSave();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-900">
//             {role ? "Edit Role" : "Add Role"}
//           </h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
//             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="px-6 py-4 space-y-4">
//             {error && (
//               <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
//                 {error}
//               </div>
//             )}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description
//               </label>
//               <textarea
//                 rows={3}
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//               />
//             </div>
//           </div>

//           <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
//             >
//               {loading ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

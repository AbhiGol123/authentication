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
  permissions: {
    user_management: boolean
    role_management: boolean
  }
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
  const [userRole, setUserRole] = useState<string | null>(null)
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
        
        // Get user role from our custom users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (!userError && userData) {
          setUserRole(userData.role)
        }
        
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      </div>
    )
  }

  // Check if user has required permissions
  const userPermissions = roles.find(r => r.name === userRole)?.permissions || { user_management: false, role_management: false }
  const canManageUsers = userPermissions.user_management
  const canManageRoles = userPermissions.role_management

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => router.push('/profile')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </button>
                  <div className="hidden md:flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-800 font-medium text-sm">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{user?.email}</span>
                      <span className="text-xs text-gray-500">{userRole || 'No role'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                disabled={!canManageUsers}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users' && canManageUsers
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${!canManageUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                disabled={!canManageRoles}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles' && canManageRoles
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${!canManageRoles ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Role Management
              </button>
            </nav>
          </div>

          {/* Content */}
          {activeTab === 'users' && canManageUsers ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
                  <button
                    onClick={handleAddUser}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add User
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {u.role || 'No role'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(u)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'roles' && canManageRoles ? (
            <div className=" shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Roles</h3>
                  <button
                    onClick={handleAddRole}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Role
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Users
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((r) => (
                      <tr key={r.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {r.name}
                          {r.name === 'superadmin' && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              System
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {r.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col space-y-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.permissions.user_management ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              User Management: {r.permissions.user_management ? 'Yes' : 'No'}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.permissions.role_management ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              Role Management: {r.permissions.role_management ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {users.filter(u => u.role === r.name).length} users
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {r.name !== 'superadmin' && (
                            <>
                              <button
                                onClick={() => handleEditRole(r)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteRole(r.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have permission to access this section.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        if (canManageUsers) setActiveTab('users')
                        else if (canManageRoles) setActiveTab('roles')
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Switch to Available Section
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(user?.role || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (user) {
        // Update existing user
        const { error } = await supabase.from('users').update({ email, role: role || null }).eq('id', user.id)
        if (error) setError(error.message); else onSave()
      } else {
        // Create new user in Supabase auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password: password || 'TempPass123!',
        })
        
        if (authError) {
          setError(authError.message)
          return
        }
        
        // Add user to our users table
        const { error: userError } = await supabase.from('users').insert({ 
          id: authData.user?.id,
          email, 
          role: role || null 
        })
        
        if (userError) setError(userError.message); else onSave()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{user ? 'Edit User' : 'Add User'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            {!user && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Leave blank for default password"
                />
              </div>
            )}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role" value={role} onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">No role</option>
                {roles.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button" onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save'}
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
  const [userManagement, setUserManagement] = useState(role?.permissions?.user_management || false)
  const [roleManagement, setRoleManagement] = useState(role?.permissions?.role_management || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const permissions = {
        user_management: userManagement,
        role_management: roleManagement
      }
      
      if (role) {
        // Update existing role
        const { error } = await supabase.from('roles').update({ name, description, permissions }).eq('id', role.id)
        if (error) setError(error.message); else onSave()
      } else {
        // Create new role
        const { error } = await supabase.from('roles').insert({ name, description, permissions })
        if (error) setError(error.message); else onSave()
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{role ? 'Edit Role' : 'Add Role'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                disabled={role?.name === 'superadmin'}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="user-management"
                    type="checkbox"
                    checked={userManagement}
                    onChange={(e) => setUserManagement(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="user-management" className="ml-2 block text-sm text-gray-900">
                    User Management
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-management"
                    type="checkbox"
                    checked={roleManagement}
                    onChange={(e) => setRoleManagement(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="role-management" className="ml-2 block text-sm text-gray-900">
                    Role Management
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              type="button" onClick={onClose}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading || role?.name === 'superadmin'}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
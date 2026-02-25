import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, LogOut, Lock, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Doctor':
        return 'bg-blue-100 text-blue-800';
      case 'HospitalEmployee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor(user?.role || '')}`}>
                <Shield className="h-4 w-4 mr-1" />
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Key className="h-5 w-5 mr-2 text-gray-400" />
            Change Password
          </h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showPasswordForm ? 'Cancel' : 'Change'}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="px-6 py-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Key className="h-4 w-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="space-y-3">
          {user?.role === 'Admin' && (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">Administrator</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Full access to all features</li>
                <li>Manage doctors, patients, and appointments</li>
                <li>Create and delete users</li>
                <li>View all data and reports</li>
              </ul>
            </div>
          )}
          {user?.role === 'Doctor' && (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">Doctor</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>View patients and appointments</li>
                <li>View doctor list</li>
                <li>Complete appointments</li>
                <li>Access patient medical history</li>
              </ul>
            </div>
          )}
          {user?.role === 'HospitalEmployee' && (
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">Hospital Employee</p>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Manage patients (create, update)</li>
                <li>Create and reschedule appointments</li>
                <li>View doctors and patients</li>
                <li>Register new users</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
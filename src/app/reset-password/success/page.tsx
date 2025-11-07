'use client'

import { useRouter } from 'next/navigation'

export default function ResetPasswordSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-6 sm:px-8 py-8 text-center">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Password reset!
            </h1>

            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully reset.
            </p>

            <button
              onClick={() => router.push('/login')}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

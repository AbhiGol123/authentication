'use client'

import { useRouter } from 'next/navigation'

export default function ForgotPasswordSentPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="px-8 pt-8 pb-8 text-center">
            <h1 className="text-2xl sm:text-1xl font-semibold text-gray-900">
              We have sent password recovery
              <br className="hidden sm:block" />
              instructions to your email.
            </h1>

            <p className="mt-3 text-sm text-gray-600">
              Did you not receive the email? Check your spam
              <br className="hidden sm:block" />
              filter or click resend.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Continue
              </button>

              <button
                onClick={() => router.push('/forgot-password')}
                className="inline-flex w-full items-center justify-center rounded-md border border-indigo-600 px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Resend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

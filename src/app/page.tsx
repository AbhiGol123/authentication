'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Redirecting...</h1>
        <p className="text-gray-600 text-center">
          If you are not redirected automatically,{' '}
          <a href="/login" className="text-blue-500 hover:text-blue-700 font-medium">
            click here to login
          </a>
        </p>
        
        {/* Tailwind CSS test elements */}
        <div className="mt-8 p-4 bg-red-100 rounded-lg">
          <p className="text-red-700 font-medium">Tailwind CSS Test:</p>
          <div className="mt-2 space-y-2">
            <div className="w-16 h-16 bg-blue-500 rounded"></div>
            <p className="text-green-600 font-bold">If you see colors, Tailwind is working!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
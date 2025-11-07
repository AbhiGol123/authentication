'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect immediately to login page without any delay
    router.replace('/login')
  }, [router])

  // Show nothing while redirecting
  return null
}
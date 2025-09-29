'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

export default function SupabaseStatus() {
    const [status, setStatus] = useState('checking...')

    useEffect(() => {
        let isMounted = true
            ; (async () => {
                try {
                    const { error } = await supabase.auth.getSession()
                    if (!isMounted) return
                    setStatus(error ? `error: ${error.message}` : 'ok')
                } catch (e: any) {
                    if (!isMounted) return
                    setStatus(`error: ${e?.message ?? 'unknown error'}`)
                }
            })()
        return () => {
            isMounted = false
        }
    }, [])

    return <div>Supabase status: {status}</div>
}

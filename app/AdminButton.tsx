'use client'

import { useRouter } from 'next/navigation'

export default function AdminButton() {
    const router = useRouter()

    const handleClick = () => {
        const username = prompt('Username:')
        const password = username ? prompt('Password:') : null

        if (username === 'admin' && password === 'admin123') {
            router.push('/admin')
        } else if (username !== null) {
            alert('Invalid credentials')
        }
    }

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 transition"
            aria-label="Admin"
            title="Admin"
        >
            <span className="inline-block w-6 h-6 rounded-full bg-gray-300" />
            <span className="hidden sm:inline">Admin</span>
        </button>
    )
}

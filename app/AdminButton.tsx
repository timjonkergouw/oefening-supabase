'use client'

import { useRouter } from 'next/navigation'

export default function AdminButton() {
    const router = useRouter()

    const handleClick = () => {
        router.push('/login')
    }

    return (
        <button
            onClick={handleClick}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors duration-200 hover:border-gray-400"
            aria-label="Admin Login"
            title="Admin Login"
        >
            <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
        </button>
    )
}

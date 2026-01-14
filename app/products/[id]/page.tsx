'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'

interface Product {
    id: number
    title: string
    price: number
    description: string
    category?: string
    image?: string
}

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const id = Number(params?.id)
        if (!id || Number.isNaN(id)) return
        fetchProduct(id)
    }, [params?.id])

    const fetchProduct = async (id: number) => {
        try {
            const { data, error } = await supabase
                .from('producten')
                .select('*')
                .eq('id', id)
                .single()
            if (error) {
                const errorMsg = error.message || String(error)
                if (errorMsg.includes('<!DOCTYPE html>') || errorMsg.includes('Web server is down') || errorMsg.includes('521')) {
                    console.error('Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd.')
                }
                throw error
            }
            setProduct(data)
        } catch (e) {
            console.error('Error loading product', e)
        } finally {
            setLoading(false)
        }
    }

    const addToCart = () => {
        if (!product) return
        const existing = JSON.parse(localStorage.getItem('cart') || '[]') as Array<{ id: number; qty: number }>
        const item = existing.find(i => i.id === product.id)
        if (item) item.qty += 1
        else existing.push({ id: product.id, qty: 1 })
        localStorage.setItem('cart', JSON.stringify(existing))
        alert('Added to cart')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading product...</div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Product not found</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <button onClick={() => router.back()} className="mb-6 text-sm text-gray-600 hover:text-gray-900">← Back</button>
                <div className="bg-white rounded-xl shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    <div className="w-full aspect-square bg-gray-50 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {product.image ? (
                            <img src={product.image} alt={product.title} className="object-contain w-full h-full" />
                        ) : (
                            <div className="text-gray-400">No image</div>
                        )}
                    </div>
                    <div className="p-6 md:p-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>
                        <p className="text-gray-600 mb-6">{product.description}</p>
                        <div className="flex items-center justify-between">
                            <div className="text-3xl font-bold text-green-600">€{product.price.toFixed(2)}</div>
                            <button onClick={addToCart} className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

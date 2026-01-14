'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

interface Product {
    id: number
    title: string
    price: number
    description: string
    category: string
    image?: string
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('producten')
                .select('*')
                .order('id')

            if (error) {
                const errorMsg = error.message || String(error)
                if (errorMsg.includes('<!DOCTYPE html>') || errorMsg.includes('Web server is down') || errorMsg.includes('521')) {
                    console.error('Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd.')
                }
                throw error
            }
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading products...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div id="products-section" className="mb-8 flex items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Webshop</h1>
                    <button
                        onClick={() => { setLoading(true); fetchProducts() }}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <a href={`/products/${product.id}`} key={product.id} className="bg-white rounded-xl border border-gray-100 block card-hover overflow-hidden">
                            {product.image && (
                                <div className="w-full aspect-[4/3] bg-gray-50 flex items-center justify-center overflow-hidden">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={product.image} alt={product.title} className="object-contain w-full h-full" />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 text-center">
                                    {product.title}
                                </h3>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-center">
                                    {product.description}
                                </p>

                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold text-green-600">
                                        €{product.price.toFixed(2)}
                                    </span>
                                    <span className="text-blue-600 text-sm">View details →</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {products.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products found.</p>
                        <p className="text-gray-400 mt-2">Import products using the admin page.</p>
                        <p className="text-red-500 mt-4 text-sm">
                            Als je een database fout ziet, controleer of je Supabase project actief is in het Supabase dashboard.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

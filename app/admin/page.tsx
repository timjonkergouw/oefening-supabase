'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

interface Product {
    id: number
    title: string
    price: number
    description: string
    category: string
}

export default function AdminPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('producten')
                .select('*')
                .order('id')

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
            setMessage('Error fetching products')
        } finally {
            setLoading(false)
        }
    }

    const importProducts = async () => {
        setImporting(true)
        setMessage('')

        try {
            const response = await fetch('/api/import')
            const result = await response.json()

            if (response.ok) {
                setMessage('Products imported successfully!')
                fetchProducts() // Refresh the list
            } else {
                setMessage(`Error: ${result.error}`)
            }
        } catch (error) {
            setMessage('Error importing products')
        } finally {
            setImporting(false)
        }
    }

    const deleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return

        try {
            const { error } = await supabase
                .from('producten')
                .delete()
                .eq('id', id)

            if (error) throw error

            setMessage('Product deleted successfully!')
            fetchProducts() // Refresh the list
        } catch (error) {
            setMessage('Error deleting product')
        }
    }

    const clearAllProducts = async () => {
        if (!confirm('Are you sure you want to delete ALL products? This cannot be undone!')) return

        try {
            const { error } = await supabase
                .from('producten')
                .delete()
                .neq('id', 0) // Delete all rows

            if (error) throw error

            setMessage('All products deleted successfully!')
            fetchProducts() // Refresh the list
        } catch (error) {
            setMessage('Error clearing products')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                    <div className="space-x-4">
                        <a
                            href="/"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                        >
                            Home
                        </a>
                        <a
                            href="/products"
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
                        >
                            View Products
                        </a>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Product Management</h2>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={importProducts}
                            disabled={importing}
                            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
                        >
                            {importing ? 'Importing...' : 'Import Products from API'}
                        </button>

                        <button
                            onClick={clearAllProducts}
                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
                        >
                            Clear All Products
                        </button>
                    </div>

                    {message && (
                        <div className={`mt-4 p-3 rounded ${message.includes('Error') || message.includes('error')
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Products ({products.length})
                    </h2>

                    {products.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No products found. Import some products to get started.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {product.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                <div className="truncate" title={product.title}>
                                                    {product.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                €{product.price.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="text-red-600 hover:text-red-900 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

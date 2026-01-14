'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
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
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editForm, setEditForm] = useState<Partial<Product>>({})

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
                    throw new Error('Supabase database is niet bereikbaar. Het project is waarschijnlijk gepauzeerd. Ga naar je Supabase dashboard en herstart het project.')
                }
                throw error
            }
            setProducts(data || [])
        } catch (error: any) {
            console.error('Error fetching products:', error)
            const errorMsg = error?.message || String(error)
            if (errorMsg.includes('Supabase database is niet bereikbaar')) {
                setMessage(errorMsg)
            } else {
                setMessage(`Error fetching products: ${errorMsg}`)
            }
        } finally {
            setLoading(false)
        }
    }

    const importProducts = async () => {
        setImporting(true)
        setMessage('')

        try {
            const response = await axios.get('/api/import')
            const result = response.data

            if (response.status === 200) {
                setMessage('Products imported successfully!')
                fetchProducts() // Refresh the list
            } else {
                setMessage(`Error: ${result.error || 'Unknown error'}`)
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Error importing products'
            setMessage(`Error: ${errorMsg}`)
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

    const startEdit = (product: Product) => {
        setEditingId(product.id)
        setEditForm({
            title: product.title,
            price: product.price,
            description: product.description,
            category: product.category
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const updateProduct = async () => {
        if (!editingId) return

        try {
            const { error } = await supabase
                .from('producten')
                .update({
                    title: editForm.title,
                    price: editForm.price,
                    description: editForm.description,
                    category: editForm.category
                })
                .eq('id', editingId)

            if (error) throw error

            setMessage('Product updated successfully!')
            setEditingId(null)
            setEditForm({})
            fetchProducts() // Refresh the list
        } catch (error) {
            setMessage('Error updating product')
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
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map((product) => (
                                        <tr key={product.id} className={editingId === product.id ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {product.id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                {editingId === product.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.title || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                ) : (
                                                    <div className="truncate" title={product.title}>
                                                        {product.title}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {editingId === product.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.category || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                ) : (
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                        {product.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {editingId === product.id ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editForm.price || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                                    />
                                                ) : (
                                                    <span>€{product.price.toFixed(2)}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                {editingId === product.id ? (
                                                    <textarea
                                                        value={editForm.description || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <div className="truncate" title={product.description}>
                                                        {product.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {editingId === product.id ? (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={updateProduct}
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors border border-green-700/20 shadow-sm"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => startEdit(product)}
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors border border-blue-700/20 shadow-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProduct(product.id)}
                                                            className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors border border-red-700/20 shadow-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
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

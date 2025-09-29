'use client'

import { useEffect, useMemo, useState } from 'react'
import supabase from '@/lib/supabase'

interface CartItem { id: number; qty: number }
interface Product { id: number; title: string; price: number; image?: string }

export default function CartButton() {
    const [open, setOpen] = useState(false)
    const [items, setItems] = useState<CartItem[]>([])
    const [products, setProducts] = useState<Record<number, Product>>({})

    useEffect(() => {
        const raw = localStorage.getItem('cart')
        const parsed = raw ? (JSON.parse(raw) as CartItem[]) : []
        setItems(parsed)
    }, [open])

    useEffect(() => {
        if (items.length === 0) { setProducts({}); return }
        const ids = items.map(i => i.id)
            ; (async () => {
                const { data } = await supabase.from('producten').select('id,title,price,image').in('id', ids)
                const map: Record<number, Product> = {}
                    ; (data || []).forEach(p => { map[p.id] = p as Product })
                setProducts(map)
            })()
    }, [items])

    const total = useMemo(() => items.reduce((sum, it) => sum + (products[it.id]?.price || 0) * it.qty, 0), [items, products])
    const count = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items])

    const clearCart = () => {
        localStorage.removeItem('cart')
        setItems([])
    }

    return (
        <>
            <button onClick={() => setOpen(true)} className="inline-flex items-center justify-center rounded-full p-2 hover:bg-gray-100 transition" aria-label="Cart" title={`Cart (${count})`}>
                {/* cart icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#0a0a0a" aria-hidden>
                    <path d="M7 18c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm10 0c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zM6.346 5l-.309-1.545A2 2 0 0 0 4.08 2H2v2h2.08l2.4 12.003A2 2 0 0 0 8.44 18h9.52a2 2 0 0 0 1.96-1.558L22 7H6.653l-.307-2zM20 9l-1.6 6H8.44L7.307 9H20z" />
                </svg>
                {/* optional badge */}
                {count > 0 && (
                    <span className="ml-1 text-xs font-semibold">{count}</span>
                )}
            </button>

            {open && (
                <div className="fixed inset-0 z-40 animate-fade-in">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-full sm:w-[380px] bg-white shadow-xl z-50 flex flex-col animate-slide-in-right">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="font-semibold">Your Cart ({count})</div>
                            <button onClick={() => setOpen(false)} className="text-sm text-gray-600 hover:text-gray-900">Close</button>
                        </div>
                        <div className="flex-1 overflow-auto divide-y">
                            {items.length === 0 ? (
                                <div className="p-6 text-gray-500">Your cart is empty.</div>
                            ) : (
                                items.map(it => {
                                    const p = products[it.id]
                                    return (
                                        <div key={it.id} className="p-4 flex gap-3 items-center">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {p?.image ? (<img src={p.image} alt={p.title} className="w-12 h-12 object-contain bg-gray-50 rounded" />) : (<div className="w-12 h-12 bg-gray-100 rounded" />)}
                                            <div className="flex-1">
                                                <div className="text-sm font-medium line-clamp-1">{p?.title || 'Product'}</div>
                                                <div className="text-xs text-gray-500">Qty: {it.qty}</div>
                                            </div>
                                            <div className="text-sm font-semibold">€{((p?.price || 0) * it.qty).toFixed(2)}</div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <div className="border-t p-4 flex items-center justify-between">
                            <div className="text-lg font-bold">Total: €{total.toFixed(2)}</div>
                            <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700">Clear</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

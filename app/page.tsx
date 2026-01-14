'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Welkom op de webshop</h1>
        <p className="text-gray-600">
          Gebruik de navigatie om naar de producten te gaan.
        </p>
        <a
          href="/products"
          className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition"
        >
          Ga naar producten
        </a>
      </div>
    </div>
  )
}

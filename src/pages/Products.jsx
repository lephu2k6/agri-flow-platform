import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'

export default function Products() {
  const [items, setItems] = useState([])

  useEffect(() => {
    getProducts().then(res => setItems(res.data))
  }, [])

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {items.map(p => (
        <div key={p.id} className="border p-4">
          <h3 className="font-bold">{p.title}</h3>
          <p>{p.price} VND</p>
          <p>{p.location}</p>
        </div>
      ))}
    </div>
  )
}

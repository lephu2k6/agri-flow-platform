import { useEffect, useState } from 'react'
import { getMyProducts } from '../services/productService'
import { useAuth } from '../context/AuthContext'

export default function MyProducts() {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    getMyProducts(user.id).then(res => setItems(res.data))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Bài đăng của tôi</h2>
      {items.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  )
}

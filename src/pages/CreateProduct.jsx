import { createProduct } from '../services/productService'
import { useAuth } from '../context/AuthContext'

export default function CreateProduct() {
  const { user } = useAuth()

  const submit = async e => {
    e.preventDefault()
    const f = e.target
    await createProduct({
      user_id: user.id,
      title: f.title.value,
      price: f.price.value,
      quantity: f.quantity.value,
      location: f.location.value,
      description: f.description.value
    })
    alert('Đăng bài thành công')
  }

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto p-6 space-y-3">
      <input name="title" placeholder="Tên nông sản" />
      <input name="price" placeholder="Giá" />
      <input name="quantity" placeholder="Số lượng" />
      <input name="location" placeholder="Khu vực" />
      <textarea name="description" placeholder="Mô tả" />
      <button className="bg-green-600 text-white w-full py-2">Đăng bán</button>
    </form>
  )
}

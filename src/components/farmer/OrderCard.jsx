export default function OrderCard({ order }) {
  return (
    <div className="border p-4 rounded bg-white">
      <p>🧾 Đơn #{order.id}</p>
      <p>Số lượng: {order.quantity}</p>
      <p>Trạng thái: {order.status}</p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { farmerService } from '../../services/farmer.service'
// import { useAuth } from '../../hooks/useAuth'
import OrderCard from '../../components/farmer/OrderCard'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    farmerService.getFarmerOrders(user.id).then(res => {
      if (res.success) setOrders(res.orders)
    })
  }, [user.id])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📦 Đơn hàng</h1>
      <div className="space-y-3">
        {orders.map(o => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  )
}

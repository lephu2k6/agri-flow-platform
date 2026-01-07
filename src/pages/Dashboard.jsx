import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  return <div className="p-6">Xin chào {user.email}</div>
}

import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">My Orders</h1>

      {/* Placeholder if there are no orders */}
      <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500">
        You have no orders yet.
      </div>

      {/* Future: Replace with a list of real orders */}
      {/* <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: ${order.total}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Orders;

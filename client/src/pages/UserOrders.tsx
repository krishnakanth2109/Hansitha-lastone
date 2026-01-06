import React from 'react';

const UserOrders = () => {
  // Replace this with real data from your backend or Clerk DB
  const orders = [
    { id: 1, date: '2025-06-01', total: '$59.99' },
    { id: 2, date: '2025-06-15', total: '$29.99' }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      <ul className="space-y-2">
        {orders.map(order => (
          <li key={order.id} className="border p-2 rounded">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: {order.total}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserOrders;

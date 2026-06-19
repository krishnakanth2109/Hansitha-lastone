// --- START OF FILE: client/src/pages/TrackingOrders.tsx (CORRECTED AND DYNAMIC) ---

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import axios from "axios"; // Import axios for API calls
import {
  ChevronLeft,
  ClipboardCheck,
  Ship,
  Truck,
  Home,
  MapPin,
  User,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import truckImageUrl from "../assets/truck-image.png";

// --- Helper Data (No changes needed) ---
const timelineSteps = [
  { status: "processing", title: "Order Placed", icon: ClipboardCheck },
  { status: "shipped", title: "Shipped", icon: Ship },
  { status: "in-transit", title: "In Transit", icon: Truck },
  { status: "delivered", title: "Delivered", icon: Home },
];

// --- Sub-components (No changes needed) ---
const InfoCard = ({ title, icon: Icon, children }) => ( <div className="bg-card p-6 rounded-lg border border-border shadow-sm"> <div className="flex items-center gap-3 mb-4"> <Icon className="h-6 w-6 text-primary" /> <h3 className="text-lg font-semibold">{title}</h3> </div> <div className="text-sm text-muted-foreground space-y-1"> {children} </div> </div> );
const HorizontalOrderStatusTimeline = ({ currentStatus }) => { const currentStatusIndex = timelineSteps.findIndex(step => step.status === currentStatus); const numberOfSegments = timelineSteps.length - 1; const progressPercentage = (currentStatusIndex / numberOfSegments) * 100; return ( <div className="bg-card p-8 rounded-lg border border-border shadow-sm w-full"> <h2 className="text-xl font-semibold mb-16 text-center">Order Journey</h2> <div className="relative"> <div className="absolute top-5 left-0 w-full h-1 bg-border rounded-full" /> <motion.div className="absolute top-5 left-0 h-1 bg-primary rounded-full" initial={{ width: '0%' }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, ease: "easeInOut" }} /> <motion.div className="absolute z-10 -top-11" initial={{ left: '0%', x: '-50%' }} animate={{ left: `${progressPercentage}%` }} transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }} > <img src={truckImageUrl} alt="Delivery Truck" className="w-24 h-24 object-contain transition-transform duration-500 hover:scale-110" /> </motion.div> <div className="relative flex justify-between"> {timelineSteps.map((step, index) => { const isCompleted = index <= currentStatusIndex; const isActive = index === currentStatusIndex; return ( <div key={step.status} className="flex flex-col items-center text-center w-24"> <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-500 ${isActive ? 'bg-primary border-primary ring-4 ring-primary/20' : isCompleted ? 'bg-primary border-primary' : 'bg-card border-border'}`}> <step.icon className={`h-5 w-5 ${isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'}`} /> </div> <p className={`mt-3 font-semibold text-sm transition-colors duration-500 ${isActive ? 'text-primary' : 'text-foreground'}`}> {step.title} </p> </div> ); })} </div> </div> </div> ); };


// --- Main TrackingOrders Component ---
export default function TrackingOrders() {
    // Get the orderId from the URL, e.g., /tracking-orders/12345
    const { orderId } = useParams();
    const navigate = useNavigate();

    // State to hold our data, loading status, and any errors
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // This effect runs when the component loads to fetch data from the backend
    useEffect(() => {
        if (!orderId) {
            setError("No order ID provided in the URL.");
            setLoading(false);
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                // Make an API call to your backend to get the order details
                const response = await axios.get(`/api/orders/${orderId}`);
                setOrder(response.data); // Save the fetched order data in state
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("Could not find or fetch the specified order.");
            } finally {
                setLoading(false); // Stop the loading indicator
            }
        };

        fetchOrderDetails();
    }, [orderId]); // Re-run this effect if the orderId in the URL changes

    // Show a loading message while fetching data
    if (loading) {
        return <div className="container mx-auto p-8 text-center">Loading Order Details...</div>;
    }

    // Show an error message if the fetch failed or no order was found
    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">{error || "Order Not Found"}</h1>
                <p className="text-muted-foreground mb-4">Please check the order ID or go back to your account.</p>
                <Button onClick={() => navigate('/account')}>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Go to Account
                </Button>
            </div>
        );
    }

    // If data is successfully loaded, render the main page content
    return (
        <div className="bg-background min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Orders
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Order Details</h1>
                            <p className="text-muted-foreground">
                                {/* Use the real order ID from the fetched data */}
                                Order ID: <span className="font-mono text-primary">{order._id}</span>
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                            <p className="text-sm text-muted-foreground">Order Placed On</p>
                            {/* Format the real date from the fetched data */}
                            <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    {/* Pass the real order status to the timeline */}
                    <HorizontalOrderStatusTimeline currentStatus={order.status} />

                    {/* Use a 2-column grid for better layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Display the real shipping address */}
                        <InfoCard title="Shipping Address" icon={MapPin}>
                            <p className="font-semibold text-foreground">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.line1}</p>
                            <p>{order.shippingAddress.city}</p>
                        </InfoCard>
                        
                        {/* Display the real payment information */}
                        <InfoCard title="Payment Information" icon={CreditCard}>
                            <p>Paid with Credit Card</p> {/* This can be made dynamic later */}
                            <p>Status: <span className="font-semibold capitalize">{order.status}</span></p>
                            <p className="mt-2 font-bold text-lg text-foreground">
                                Total: ₹{order.amount.toFixed(2)}
                            </p>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
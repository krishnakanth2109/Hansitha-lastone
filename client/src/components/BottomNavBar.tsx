import {
  Home,
  HomeIcon,
  Store,
  StoreIcon,
  Heart,
  HeartIcon,
  Search,
  SearchIcon,
  User,
  UserIcon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

interface BottomNavBarProps {
  onAccountClick: () => void;
  onSearchClick: () => void;
}

const BottomNavBar = ({ onAccountClick, onSearchClick }: BottomNavBarProps) => {
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const wishlistCount = wishlist.length;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    {
      label: 'Home',
      href: '/',
      badge: 0,
      onClick: () => navigate('/'),
      icon: Home,
      activeIcon: HomeIcon,
    },
    {
      label: 'Shop',
      href: '/shop',
      badge: 0,
      onClick: () => navigate('/shop'),
      icon: Store,
      activeIcon: StoreIcon,
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      badge: wishlistCount,
      onClick: () => navigate('/wishlist'),
      icon: Heart,
      activeIcon: HeartIcon,
    },
    {
      label: 'Search',
      href: '#',
      badge: 0,
      onClick: () => {
        onSearchClick?.();
      },
      icon: Search,
      activeIcon: SearchIcon,
    },
    {
      label: 'Account',
      href: user ? '/account' : '/login',
      badge: 0,
      onClick: () => {
        onAccountClick?.();
        navigate(user ? '/account' : '/login');
      },
      icon: User,
      activeIcon: UserIcon,
    },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 shadow-md w-full fixed bottom-0 z-50 md:rounded-none md:static md:shadow-none">
      <div className="flex items-center justify-around h-16 w-full sm:max-w-md sm:mx-auto sm:rounded-2xl sm:mb-4 sm:shadow-xl sm:bg-white sm:border sm:border-gray-200 sm:overflow-hidden">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                window.scrollTo(0, 0);
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all duration-200 ${
                isActive
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;

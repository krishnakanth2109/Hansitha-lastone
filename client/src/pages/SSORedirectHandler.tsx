import React, { useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SSORedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error('No account found. Please Sign Up First.');
    navigate('/login');
  }, []);

  return null;
};

export default SSORedirectHandler;

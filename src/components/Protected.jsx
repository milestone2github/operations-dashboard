import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { setLoading, setLoggedIn, setUser } from '../redux/auth/userSlice';
const PERMISSION_NAME = 'Operations Dashboard' 

function Protected({children}) {
  const {isLoggedIn, isLoading} = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to check if the user is already logged in
    const checkLoggedIn = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/checkLoggedIn`, {
          method: "GET",
          credentials: 'include'
        });
        const data = await response.json();

        if (!data.loggedIn) {
          navigate('/login', { replace: true }); // navigate if not logged in
        } 
        else if (!data.user?.role?.permissions.includes(PERMISSION_NAME)) {
          navigate('/login?error=permissionDenied', {replace: true})
        }
        dispatch(setLoggedIn(data.loggedIn));
        dispatch(setUser(data.user));
      } catch (error) {
        console.error("Error Checking session", error);
        navigate('/login?error=InternalServerError', {replace: true})
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!isLoggedIn) { // Check on initial render and dependency changes
      checkLoggedIn();
    }
  }, [dispatch, navigate, isLoggedIn]);

  if (isLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center'>
        <div className='loader'>
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : null;
}

export default Protected;

import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import axios from 'axios'
import Loader from './Loader'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ProtectedRoute = ({ children }) => {
    const [isLoading, setisLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    useEffect(() => {
        const checkValid = async () => {
            let res;
            try {
                res = await axios(`${BASE_URL}/LoginStatus`, {
                    withCredentials: true,
                });
                console.log("Login status response:", res.data);
                setIsAuthenticated(res?.data?.isLogin || false);
            }
            catch (err) {
                console.log(err.status);
                // if (err.status == 401) {
                //     console.log("Login status check returned 401, attempting to refresh tokens.");
                //     try {
                //         res = await axios(`${BASE_URL}/refreshTokens`, {
                //             withCredentials: true,
                //         })
                //         console.log("Login status response:", res.data);
                //         setIsAuthenticated(res?.data?.isLogin || false);
                //         // console.log("User is authenticated:", isAuthenticated);
                //     }
                //     catch (err) {
                //         console.error("Error occurred while refreshing tokens:", err);
                //     }
                // }
            } finally {
                setisLoading(false);
            }
        }
        checkValid();
    }, [])

    if (isLoading) {
        return <Loader />
    }
    if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to login page.");
        return <Navigate to='/login' replace />
    }
    return children;
};

export default ProtectedRoute

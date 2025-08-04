// 'use client'
// import { useAuthStore } from "@/store/authStore";
// import { useRouter } from "next/navigation";
// const Dashboard = () => {
//   const router = useRouter()
//   const logout = useAuthStore((state) => state.logout);
//   const handleLogOut = () => {
//     logout();
//     router.replace("/");
//   };
//   return (
//     <div className='flex flex-col items-center justify-center h-screen'>
//         <h1 className='font-semibold text-2xl'>Dashboard</h1>
//         <button onClick={handleLogOut} className='mt-4 px-4 py-2 rounded'>
//           Log Out
//         </button>
//     </div>
//   );
// };

// export default Dashboard;

'use client'
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const router = useRouter();
  const { logout, checkAuth, authUser, isloggingin } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
          localStorage.setItem('authToken', tokenFromUrl);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }

        await checkAuth(router as any);
        
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        router.replace('/login');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [checkAuth, router]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isInitializing && !isloggingin && !authUser) {
      router.replace('/login');
    }
  }, [isInitializing, isloggingin, authUser, router]);

  const handleLogOut = async () => {
    await logout();
    router.replace("/");
  };

  // Show loading while initializing or checking auth
  if (isInitializing || isloggingin) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"></div>
        <p className="mt-4">Loading dashboard...</p>
      </div>
    );
  }

  // Show error if not authenticated
  if (!authUser) {
    return (
      <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='font-semibold text-2xl'>Access Denied</h1>
        <p className="mt-2">Please log in to access the dashboard.</p>
        <button 
          onClick={() => router.replace('/auth')} 
          className='mt-4 px-4 py-2 rounded'
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='font-semibold text-2xl'>Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome, {authUser.name}!</p>
      <button 
        onClick={handleLogOut} 
        className='mt-4 px-4 py-2 rounded'
      >
        Log Out
      </button>
    </div>
  );
};

export default Dashboard;
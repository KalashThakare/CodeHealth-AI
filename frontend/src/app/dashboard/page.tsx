'use client'
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout);
  const handleLogOut = () => {
    logout();
    router.replace("/");
  };
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        <h1 className='font-semibold text-2xl'>Dashboard</h1>
        <button onClick={handleLogOut} className='mt-4 px-4 py-2 rounded'>
          Log Out
        </button>
    </div>
  );
};

export default Dashboard;

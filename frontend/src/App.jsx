import { Navigate, Route, Routes } from "react-router-dom";

import RightPanel from './components/common/RightPanel';
import Sidebar from './components/common/Sidebar';
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from 'react-hot-toast';
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from './components/common/LoadingSpinner';
import FollowersPage from "./pages/profile/FollowersPage";
import FollowingPage from './pages/profile/FollowingPage';
import MessageInbox from "./pages/messages/MessageInbox";
import ChatPage from "./pages/messages/ChatPage";

function App() {
	const {data:authUser, isLoading}=useQuery({
		queryKey:["authUser"],
		queryFn:async()=>{
			try {
				const res = await fetch('/api/auth/me');
				const data = await res.json();
				if(data.error) return null;
				if(!res.ok){
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error)
			}
		},
		retry:false,
	});

	if(isLoading){
		return (
			<div className="h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		)
	}
	return (
		<div className='flex max-w-6xl mx-auto'>
			<Toaster />
			{authUser && <Sidebar />}
			<Routes>
				<Route path='/' element={authUser? <HomePage /> : <Navigate to='/login' /> } />
				<Route path='/signup' element={!authUser ? <SignUpPage />: <Navigate to='/' />  } />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/messages' element={authUser? <MessageInbox /> : <Navigate to='/login' />} />
				<Route path='/messages/:username' element={authUser? <ChatPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser? <ProfilePage /> : <Navigate to='/login' />} />
				<Route path='/profile/followers/:username' element={authUser? <FollowersPage /> : <Navigate to='/login' />} />
				<Route path='/profile/following/:username' element={authUser? <FollowingPage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
		</div>
	);
}

export default App
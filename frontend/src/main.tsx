import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import About from './pages/About/About'
import Studio from './pages/Studio/Studio.tsx'
import ErrorPage from './pages/ErrorPage/ErrorPage.tsx'
import { RouterProvider , createBrowserRouter , createRoutesFromElements , Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard.tsx'
import Broadcast from './components/Broadcast/Broadcast.tsx'
import Destination from './components/Destination/Destination.tsx'
import Auth from './pages/Auth/Auth.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.tsx'
import { Toaster } from './components/ui/toaster.tsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='' element={<App/>}/>
      <Route path='about' element={<About/>}/>
      <Route element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }>
        <Route
          path="broadcast"
          element={<Broadcast />}
        />
        <Route 
          path="destination" 
          element={<Destination />}
        />
      </Route>
      <Route path='studio/:studioId' element={<Studio/>} />
      <Route path='auth' element={<Auth/>}/>
      <Route path='*' element={<ErrorPage/>}/>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster/>
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>,
)

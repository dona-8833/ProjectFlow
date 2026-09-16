import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { createClient } from '@/lib/supabase/client'
import { Spinner } from '@/components/ui/Spinner'


interface AuthProviderProps {
    children:React.ReactNode
}

const AuthProvider = ({children}:AuthProviderProps) => {
    const [loading,setLoading] = useState(true)
    const setAuth = useAuthStore((state) => state.setAuth)
    useEffect(()=>{
        
      const supabase = createClient()
       const GetInitialSession = async () => {
        try{

            const {data:{session}} = await supabase.auth.getSession()
            setAuth(session)
        }finally{
            setLoading(false)
        }
       } 
       GetInitialSession()
       const {data:{subscription}} = supabase.auth.onAuthStateChange(
        (_event,session) => {
            setAuth(session)
        }
       )
       return () => {
        subscription.unsubscribe()
       }

    },[setAuth])
    if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner/>
      </div>
    );
  }
  return (
    <>{children}</>
  )
}

export default AuthProvider
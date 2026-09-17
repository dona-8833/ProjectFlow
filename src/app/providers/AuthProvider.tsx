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
const clearAuth = useAuthStore((state) => state.clearAuth)
const supabase = createClient()
    useEffect(()=>{
        
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
        (event,session) => {
          if (event === "SIGNED_OUT"){
            clearAuth()
          }else{
            setAuth(session)
          }
        }
       )
       return () => {
        subscription.unsubscribe()
       }

    },[setAuth,clearAuth])
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
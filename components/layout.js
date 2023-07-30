import { useRouter } from 'next/router'
import Nav from './nav/nav'
import { Source_Code_Pro } from 'next/font/google'
import { useEffect, useState } from 'react'
import { useStore } from '@/utils/store'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserById } from "../utils/firestore"


const source_code_pro = Source_Code_Pro({ subsets: ['latin'] })

export default function Layout({ children }) {


  const loggedInUser = useStore(state => state.loggedInUser)
  const router = useRouter()
  const auth = getAuth()

  const [isLogin, setIsLogin] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (router.isReady) {

      if (router.pathname === "/login") setIsLogin(true)
      else if (isLogin) setIsLogin(false)

      // prevents route from prematurely rendering
      // reroutes from _app.js after initial authorization check
      if (router.pathname === "/" && !auth.currentUser) {
        router.push('/login')
        return
      }

      setReady(true)
    }
  }, [auth.currentUser, isLogin, loggedInUser, ready, router])


  return ready && (
    <>
      <div className={source_code_pro.className}>
        {
          // hide nav on login page
          !isLogin ? <Nav /> : null
        }
        <main>
          {children}
        </main>
      </div>
    </>
  )
}

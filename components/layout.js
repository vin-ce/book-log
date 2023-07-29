import { useRouter } from 'next/router'
import Nav from './nav/nav'
import { Source_Code_Pro } from 'next/font/google'
import { useEffect, useState } from 'react'
import { useStore } from '@/utils/store'

const source_code_pro = Source_Code_Pro({ subsets: ['latin'] })

export default function Layout({ children }) {

  const router = useRouter()
  const [isLogin, setIsLogin] = useState(false)
  const [ready, setReady] = useState(false)
  const loggedInUser = useStore(state => state.loggedInUser)

  useEffect(() => {
    if (router.isReady) {

      if (router.pathname === "/login") setIsLogin(true)
      else if (isLogin) setIsLogin(false)

      // prevents route from prematurely rendering
      // reroutes from _app.js after initial authorization check
      if (router.pathname === "/" && !loggedInUser) return

      setReady(true)
    }
  }, [isLogin, loggedInUser, ready, router])



  return ready && (
    <>
      <div className={source_code_pro.className}>
        {
          !isLogin ? <Nav /> : null
        }
        <main>
          {children}
        </main>
      </div>
    </>
  )
}

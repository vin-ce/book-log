import { useEffect, useRef, useState } from "react"
import styles from "./login.module.sass"
import { initLogIn, initLogOut } from '@/utils/auth'
import { useRouter } from "next/router"
import Head from "next/head"

export default function Login() {

  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(true)
  const isLoggingIn = useRef(false)

  const handleLogin = async () => {
    if (isLoggingIn.current) return

    isLoggingIn.current = true
    const isSuccess = await initLogIn()

    isLoggingIn.current = false
    if (isSuccess) router.push('/')
    else router.push('/login?isAuthorized=false')
  }

  useEffect(() => {
    if (router.isReady) {
      if (router.query.isAuthorized === "false") setIsAuthorized(false)
    }
  }, [router.isReady, router.query, router.query.isAuthorized])


  return (
    <>
      <Head>
        <title>login</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.contentContainer}>
          {
            isAuthorized ?
              <>
                <div><span className={styles.name}>messy table</span> is currently invite only</div>
                <div>make sure vincent knows your email</div>
              </>
              :
              <div>your email was not found</div>
          }
          <div className={styles.buttonsContainer}>
            <div className={styles.button} onClick={handleLogin}>login</div>
          </div>
        </div>
      </div>
    </>
  )
}
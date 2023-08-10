import { initLogIn, initLogOut } from '@/utils/auth'
import { useStore } from "@/utils/store"
import styles from "./logInOutButtons.module.sass"
import { useRouter } from 'next/router'

export function LogInOutButtons() {
  const loggedInUser = useStore((state) => state.loggedInUser)
  let buttonEl

  if (loggedInUser) {
    buttonEl = (
      <div className={styles.nameButtonContainer}>
        @{loggedInUser.username} <LogOutButton />
      </div>
    )
  } else {
    buttonEl = <LogInButton />
  }

  return (
    <>
      {buttonEl}
    </>)
}


export function LogInButton() {
  const router = useRouter()
  const handleLogin = () => {
    if (router.pathname === "/room" || router.pathname === "/room/[id]") {
      initLogIn({ isRoomUser: true })
    } else {
      router.push('/login')
    }
  }
  return <div className={styles.button} onClick={handleLogin}>log in</div>
}

export function LogOutButton() {
  const router = useRouter()

  const logOut = async () => {
    await initLogOut()
    if (router.pathname === "/room" || router.pathname === "/room/[id]") {
      router.reload()
    } else {
      router.push('/login')
    }
  }

  return <div className={styles.button} onClick={logOut}>log out</div>
}


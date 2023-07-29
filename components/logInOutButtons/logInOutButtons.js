import { useRouter } from "next/navigation";
import { initLogIn, initLogOut } from '@/utils/auth'
import { useStore } from "@/utils/store"
import styles from "./logInOutButtons.module.sass"



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


function LogInButton() {
  const router = useRouter()
  const handleLogin = () => router.push('/login')
  return <div className={styles.button} onClick={handleLogin}>log in</div>
}

function LogOutButton() {
  const router = useRouter()

  const logOut = async () => {
    await initLogOut()
    router.push('/login')
  }

  return <div className={styles.button} onClick={logOut}>log out</div>
}


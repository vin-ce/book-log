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
  return <div className={styles.button} onClick={initLogIn}>log in</div>
}

function LogOutButton() {
  const router = useRouter()

  const logOut = async () => {
    const isSuccess = await initLogOut()
    if (isSuccess) router.push('/')
    else router.push('/?unauthorized')
  }

  return <div className={styles.button} onClick={logOut}>log out</div>
}


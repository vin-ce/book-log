'use client'

import { useRouter } from "next/navigation";
import { initLogIn, initLogOut } from '../utils/auth'
import { useStore } from "../utils/store"
import styles from "./logButtons.module.sass"

function LogInButton() { return <div className={styles.button} onClick={initLogIn}>&#91;log in&#93;</div> }

function LogOutButton() {
  const router = useRouter()

  const logOut = async () => {
    const isSuccess = await initLogOut()
    // navigate to home page
    if (isSuccess) router.push('/')
  }

  return <div className={styles.button} onClick={logOut}>&#91;log out&#93;</div>
}



export function LogButtons() {
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

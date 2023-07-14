'use client'

import Link from "next/link"
import { useStore } from "../utils/store"

import styles from "./nav.module.sass"
import { LogButtons } from "./logButtons"

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUser } from "../utils/firestore"

const auth = getAuth();

export default function Nav() {

  const setLoggedInUser = useStore((state) => state.setLoggedInUser)
  const setLoggedOut = useStore((state) => state.setLoggedOut)

  // tracks global log in / out state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userData = await fetchUser(user.uid)
      setLoggedInUser({ ...userData })
    }
    else setLoggedOut()
  });

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.button}>&#91;home&#93;</Link>
      <LogButtons />
    </div>
  )
}
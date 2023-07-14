'use client'

import styles from './dashboard.module.sass'
import Link from 'next/link'
import { useStore } from "../utils/store"

export default function Dashboard() {
  const loggedInUser = useStore((state) => state.loggedInUser)

  return (
    <div className={styles.container}>
      {loggedInUser ? <LoggedInView /> : <LoggedOutView />}
    </div>
  )
}

function LoggedOutView() {
  return (
    <div>sign in to see library | shelves</div>
  )
}

function LoggedInView() {
  return (
    <Link href="/book/hello/vincent">book</Link>
  )
}

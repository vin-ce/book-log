import styles from './dashboard.module.sass'
import Link from 'next/link'
import { useStore } from "../../utils/store"
import Profile from '../profile/profile'

export default function Dashboard() {
  const loggedInUser = useStore((state) => state.loggedInUser)

  return (
    <div className={styles.panelContainer}>
      {loggedInUser ? <LoggedInView /> : <LoggedOutView />}
    </div>
  )
}

function LoggedOutView() {
  return (
    <div className={styles.container}>sign in to see your dashboard</div>
  )
}

function LoggedInView() {


  return (
    <Profile />
  )
}

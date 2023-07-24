import styles from './dashboard.module.sass'
import Link from 'next/link'
import { useStore } from "../../utils/store"
import Profile from '../profile/profile'
import { useEffect } from 'react'
import { ResetStates } from '@/utils/helpers'

export default function Dashboard() {
  const loggedInUser = useStore((state) => state.loggedInUser)
  const selectedUserId = useStore((state) => state.selectedUserId)
  const setSelectedUserId = useStore((state) => state.setSelectedUserId)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)

  useEffect(() => {
    if (!selectedUserId && loggedInUser) {
      setSelectedUserId(loggedInUser.id)
      setSelectedUserUsername(loggedInUser.username)
    }
  }, [loggedInUser, selectedUserId, setSelectedUserId, setSelectedUserUsername])

  return (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        {loggedInUser ?
          <Profile />
          :
          <div className={styles.container}>sign in to see your dashboard</div>
        }
      </div>
      <ResetStates type={"full"} />
    </div>
  )
}

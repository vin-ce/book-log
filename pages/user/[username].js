import Profile from "@/components/profile/profile"
import { fetchUserByUsername } from "@/utils/firestore"
import { ResetStates } from "@/utils/helpers"
import { useStore } from "@/utils/store"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

import styles from "./user.module.sass"
import Head from "next/head"

export default function User() {

  const [ready, setReady] = useState(false)
  const router = useRouter()

  const selectedUserUsername = useStore((state) => state.selectedUserUsername)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)
  const setSelectedUserId = useStore((state) => state.setSelectedUserId)


  useEffect(() => {
    if (router.isReady && !ready) init()

    async function init() {
      let username = router.query.username
      let userData = await fetchUserByUsername(username)
      if (!userData) return
      setSelectedUserUsername(username)
      setSelectedUserId(userData.id)

      setReady(true)
    }

  }, [ready, router, setSelectedUserId, setSelectedUserUsername])

  return (
    <>
      <Head>
        <title>@{selectedUserUsername}</title>
      </Head>
      <div className={styles.background}>
        <div className={styles.container}>
          {ready ? <Profile /> : <div>user not found</div>}
          <ResetStates type={"full"} />
        </div>
      </div>
    </>
  )

}
import { useEffect, useState } from "react"
import styles from "./roomHome.module.sass"
import { useStore } from "@/utils/store"
import RoomWrapper from "./wrapper/wrapper"
import UserSettingsModal from "@/components/modals/userSettingsModal/userSettingsModal"
import { LogInButton } from "@/components/logInOutButtons/logInOutButtons"
import RoomInfoModal from "@/components/modals/roomInfoModal/roomInfoModal"
import { fetchRoomsOfUser } from "@/utils/realtime"
import { formatDateFromSeconds } from "@/utils/helpers"
import { useRouter } from "next/router"

export default function Room() {

  const loggedInUser = useStore((state) => state.loggedInUser)
  const isUserSettingsModal = useStore(state => state.isUserSettingsModal)
  const setIsUserSettingsModal = useStore(state => state.setIsUserSettingsModal)

  const [isCreateRoomModal, setIsCreateRoomModal] = useState(false)

  const router = useRouter()

  const [roomsListEl, setRoomsListEl] = useState(null)

  useEffect(() => {

    if (loggedInUser) initRoomsListEl()

    async function initRoomsListEl() {
      const roomsData = await fetchRoomsOfUser({ userId: loggedInUser.id })
      if (roomsData.length === 0) return

      // sorts from most recently updated to oldest
      roomsData.sort((a, b) => b.createdTimestamp - a.createdTimestamp);

      let elArr = []
      roomsData.forEach(roomData => {
        elArr.push(
          <div key={roomData.roomId} className={styles.room}>
            <span className={styles.button} onClick={() => router.push(`/room/${roomData.roomId}`)}>{roomData.name}</span>
            <span className={styles.date}>* {formatDateFromSeconds(roomData.lastUpdatedTimestamp)}</span>
          </div>
        )
      })
      setRoomsListEl(elArr)
    }

  }, [loggedInUser])

  return (
    <RoomWrapper>
      {
        loggedInUser ?
          <div className={styles.background}>
            <div className={styles.container}>
              <div className={[styles.name, styles.button].join(" ")} onClick={() => setIsUserSettingsModal(true)}>@{loggedInUser.username}</div>
              <div className={styles.header}>
                <div className={styles.label}>rooms:</div>
                <div className={styles.button} onClick={() => setIsCreateRoomModal(true)}>+ create room</div>
              </div>
              <div className={styles.listContainer}>
                {
                  roomsListEl ? roomsListEl : "no saved rooms found"
                }
              </div>
            </div>
          </div>
          :
          <div className={styles.loginContainer}>
            <LogInButton />
          </div>
      }

      {/* MODALS */}
      {
        isUserSettingsModal ? <UserSettingsModal /> : null
      }
      {
        isCreateRoomModal ? <RoomInfoModal type={"create"} setIsRoomInfoModal={setIsCreateRoomModal} /> : null
      }
    </RoomWrapper>
  )
}
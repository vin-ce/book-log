import { useStore } from "@/utils/store"
import styles from "./roomInfo.module.sass"
import { formatDateFromSeconds } from "@/utils/helpers"
import { useEffect, useState } from "react"
import RoomInfoModal from "@/components/modals/roomInfoModal/roomInfoModal"

import { addRoomToUser, checkIsUserInRoom, realtimeDB, removeRoomFromUser } from "@/utils/realtime"
import { onValue, ref } from "firebase/database"
import { useRouter } from "next/router"

export default function RoomInfo() {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const setSelectedRoomInfo = useStore((state) => state.setSelectedRoomInfo)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const [isUpdateRoomInfoModal, setIsUpdateRoomInfoModal] = useState(false)
  const isRoomAdmin = useStore((state) => state.isRoomAdmin)

  // updates room info on info change
  useEffect(() => {
    const roomInfoRef = ref(realtimeDB, `rooms/${selectedRoomInfo.roomId}`)
    onValue(roomInfoRef, snap => {
      const data = snap.val()
      setSelectedRoomInfo(data)
    })
  }, [selectedRoomInfo.roomId, setSelectedRoomInfo])


  // USER IN ROOM

  const [isUserInRoom, setIsUserInRoom] = useState(false)

  useEffect(() => {
    if (loggedInUser) init()
    async function init() {
      const isInRoom = await checkIsUserInRoom({ roomId: selectedRoomInfo.roomId, userId: loggedInUser.id })
      setIsUserInRoom(isInRoom)
    }
  }, [])

  const router = useRouter()
  const handleEnterRoom = () => {
    addRoomToUser({ roomId: selectedRoomInfo.roomId, userId: loggedInUser.id })
    setIsUserInRoom(true)
  }
  const handleLeaveRoom = () => {
    removeRoomFromUser({ roomId: selectedRoomInfo.roomId, userId: loggedInUser.id })
    setIsUserInRoom(false)

    router.push('/rooms')
  }

  return (
    <div className={styles.roomInfoContainer}>
      {
        selectedRoomInfo.coverImageUrl ?
          <div className={styles.imageContainer}>
            <img src={selectedRoomInfo.coverImageUrl} alt={"Book cover."} width={400} height={480} />
          </div>
          : null
      }
      <div className={styles.header}>
        <div className={styles.name}>{selectedRoomInfo.name}</div>
        <div className={styles.buttonsContainer}>
          {
            loggedInUser && !isRoomAdmin ?
              isUserInRoom ?
                <div className={styles.button} onClick={handleLeaveRoom}>- leave</div>
                :
                <div className={styles.button} onClick={handleEnterRoom}>+ enter</div>
              : null
          }
          {
            isRoomAdmin ?
              <div className={styles.button} onClick={() => setIsUpdateRoomInfoModal(true)}>+ update room</div>
              : null
          }

        </div>
      </div>
      {
        selectedRoomInfo.description ?
          <div className={styles.description}>{selectedRoomInfo.description}</div>
          : null
      }

      <div className={styles.extraInfo}>
        <div>* on {formatDateFromSeconds(selectedRoomInfo.lastUpdatedTimestamp)}</div>
        <div>+ on {formatDateFromSeconds(selectedRoomInfo.createdTimestamp)}</div>
      </div>




      {
        isUpdateRoomInfoModal ?
          <RoomInfoModal type={"update"} setIsRoomInfoModal={setIsUpdateRoomInfoModal} />
          : null
      }

    </div>
  )
}
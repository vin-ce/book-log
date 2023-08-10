import { useEffect, useState } from "react"
import styles from "./liveCursorController.module.sass"
import { useStore } from "@/utils/store"
import { toggleLiveCursorUser } from "@/utils/realtime"

export default function LiveCursorController() {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const activeLiveCursorUserId = useStore((state) => state.activeLiveCursorUserId)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (loggedInUser && activeLiveCursorUserId === loggedInUser.id)
      setIsActive(true)
    else
      setIsActive(false)
  }, [activeLiveCursorUserId])


  const handleSetActive = () => {
    if (isActive) toggleLiveCursorUser({ roomId: selectedRoomInfo.roomId, type: "off" })
    else toggleLiveCursorUser({ roomId: selectedRoomInfo.roomId, userId: loggedInUser.id, type: "on" })
  }

  return (
    <div className={styles.container} onClick={handleSetActive}>
      {
        isActive ? "x" : "⁂"
      }
    </div>
  )
}
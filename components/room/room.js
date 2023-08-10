import { useEffect, useState } from "react"
import styles from "./room.module.sass"

import { realtimeDB } from "@/utils/realtime"
import { onValue, ref } from "firebase/database"
import AddSectionToRoomModal from "../modals/addSectionToRoomModal/addSectionToRoomModal"
import { useStore } from "@/utils/store"
import RoomSection from "./roomSection/roomSection"

export default function Room() {
  const isRoomAdmin = useStore((state) => state.isRoomAdmin)
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const [isAddSectionToRoomModal, setIsAddSectionToRoomModal] = useState(false)
  const [sectionsEl, setSectionsEl] = useState([])

  // live database
  useEffect(() => {
    // check if there is a new section made
    // if yes add section 

    const sectionsRef = ref(realtimeDB, `sections/${selectedRoomInfo.roomId}`)
    onValue(sectionsRef, snap => {
      const data = snap.val()
      console.log('sections data', data)

      if (data) {
        // Extract objects into an array
        const dataArr = Object.values(data);
        // Sort the array based on createdTimestamp in ascending order
        dataArr.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        setSectionsEl(dataArr.map(section => <RoomSection key={`section_${section.id}`} id={section.id} name={section.name} />))
      } else {
        setSectionsEl([
          <div key={"error"} className={styles.errorContainer}>no sections yet</div>,
        ])
      }

    })
  }, [])
  // updates room info on info change

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.label}>sections</div>
          {
            isRoomAdmin ?
              <div className={styles.button} onClick={() => setIsAddSectionToRoomModal(true)}>+ add section</div>
              : null
          }
        </div>

        {sectionsEl}

      </div>
      {
        isAddSectionToRoomModal ? <AddSectionToRoomModal setIsModalOpen={setIsAddSectionToRoomModal} /> : null
      }
    </>
  )
}
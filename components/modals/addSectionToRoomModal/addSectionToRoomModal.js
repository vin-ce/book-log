import { useRef, useState } from "react"
import { StandardModal } from "../modalTemplates"
import styles from "./addSectionToRoomModal.module.sass"
import { createSection } from "@/utils/realtime"
import { useStore } from "@/utils/store"

export default function AddSectionToRoomModal({ setIsModalOpen }) {

  const [nameInput, setNameInput] = useState('')
  const handleNameInputChange = (e) => setNameInput(e.target.value.trimStart())
  const nameInputRef = useRef(null)

  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)

  const onAddSection = () => {
    let name = nameInput
    name.trimEnd()
    if (!name) {
      nameInputRef.current.placeholder = '⚠️ name required'
      return
    }

    createSection({ roomId: selectedRoomInfo.roomId, sectionName: name })
    setIsModalOpen(false)
  }

  return (
    <StandardModal
      title={`Add Section`}
      setIsModelOpen={setIsModalOpen}
    >
      <input ref={nameInputRef} type="text" placeholder="name (*)" onChange={handleNameInputChange} value={nameInput} className={styles.input} />
      <div className={styles.button} onClick={onAddSection}>+ add</div>
    </StandardModal>
  )
}
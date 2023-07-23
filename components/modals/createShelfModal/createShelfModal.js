import { useStore } from "@/utils/store";
import { StandardModal } from "../modalTemplates";
import styles from "./createShelfModal.module.sass"
import { createShelf } from "@/utils/firestore";
import { useState } from "react";

export default function CreateShelfModal() {
  const userAllShelves = useStore((state) => state.userAllShelves)
  const setUserAllShelves = useStore((state) => state.setUserAllShelves)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const setIsCreateShelfModal = useStore((state) => state.setIsCreateShelfModal)


  const [shelfInput, setShelfInput] = useState('')

  const handleShelfNameChange = e => {
    e.preventDefault()

    if (e.target.value.length > 50) return

    let inputString = e.target.value

    // Step 1: Replace two or more spaces with a single space
    const regexStep1 = /\s{2,}/g;
    const result = inputString.replace(regexStep1, " ");

    setShelfInput(result)
  }

  const handleCreateShelf = async () => {
    if (shelfInput.trimStart() == "") return
    if (shelfInput.length > 50) return


    let shelfName = shelfInput
    // trim white space off start and end
    shelfName.trimStart()
    shelfName.trimEnd()

    // create shelf on firebase
    const shelfId = await createShelf({ shelfName, userId: loggedInUser.id, })
    setUserAllShelves([...userAllShelves, { id: shelfId, name: shelfName }])

    setIsCreateShelfModal(false)
  }

  return (
    <StandardModal
      title="Create Shelf"
      setIsModelOpen={setIsCreateShelfModal}
    >
      <div className={styles.inputContainer}>
        <input type="text" placeholder={"Shelf name..."} onChange={handleShelfNameChange} value={shelfInput} />
      </div>
      <div className={styles.modalButton} onClick={handleCreateShelf}>+ create shelf</div>
    </StandardModal>
  )
}
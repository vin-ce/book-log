import { useStore } from "@/utils/store";
import { StandardModal } from "../modalTemplates";
import styles from "./createShelfModal.module.sass"
import { createShelf } from "@/utils/firestore";
import { useState } from "react";
import sanitize from "sanitize-html";

export default function CreateShelfModal() {
  const userAllShelves = useStore((state) => state.userAllShelves)
  const setUserAllShelves = useStore((state) => state.setUserAllShelves)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const setIsCreateShelfModal = useStore((state) => state.setIsCreateShelfModal)


  const [nameInput, setNameInput] = useState('')

  const handleShelfNameChange = e => {
    e.preventDefault()

    if (e.target.value.length > 50) return

    let inputString = e.target.value

    // Step 1: Replace two or more spaces with a single space
    const regexStep1 = /\s{2,}/g;
    const result = inputString.replace(regexStep1, " ");

    setNameInput(result)
  }

  const [descriptionInput, setDescriptionInput] = useState('')
  const handleDescriptionInputChange = (e) => setDescriptionInput(e.target.value.trimStart())


  const handleCreateShelf = async () => {
    if (nameInput.trimStart() == "") return
    if (nameInput.length > 50) return

    let shelfName = sanitize(nameInput)
    // trim white space off start and end
    shelfName.trimStart()
    shelfName.trimEnd()

    let description = sanitize(descriptionInput)

    // create shelf on firebase
    const shelfId = await createShelf({
      shelfData: {
        name: shelfName,
        description
      }, userId: loggedInUser.id,
    })
    setUserAllShelves([...userAllShelves, { id: shelfId, name: shelfName }])

    setIsCreateShelfModal(false)
  }

  return (
    <StandardModal
      title="Create Shelf"
      setIsModelOpen={setIsCreateShelfModal}
    >
      <div className={styles.container}>
        <input type="text" placeholder={"Shelf name..."} onChange={handleShelfNameChange} value={nameInput} className={styles.input} />
        <textarea className={styles.textArea} value={descriptionInput} onChange={handleDescriptionInputChange} placeholder={"description"} rows={5} maxLength={500} />
        <div className={styles.modalButton} onClick={handleCreateShelf}>+ create shelf</div>
      </div>
    </StandardModal>
  )
}
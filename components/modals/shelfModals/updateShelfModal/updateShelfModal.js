import { useStore } from "@/utils/store";
import { StandardModal } from "../../modalTemplates";
import styles from "./updateShelfModal.module.sass"
import { updateShelf } from "@/utils/firestore";
import { useState } from "react";
import sanitize from "sanitize-html";
import { DeleteShelfModal } from "../../deleteModals/deleteModals";

export default function UpdateShelfModal() {

  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)
  const setIsUpdateShelfModal = useStore((state) => state.setIsUpdateShelfModal)

  const [nameInput, setNameInput] = useState(selectedShelfInfo.name)

  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const handleShelfNameChange = e => {
    e.preventDefault()

    if (e.target.value.length > 50) return

    let inputString = e.target.value

    // Step 1: Replace two or more spaces with a single space
    const regexStep1 = /\s{2,}/g;
    const result = inputString.replace(regexStep1, " ");

    setNameInput(result)
  }

  const [descriptionInput, setDescriptionInput] = useState(selectedShelfInfo.description)
  const handleDescriptionInputChange = (e) => setDescriptionInput(e.target.value.trimStart())


  const handleUpdateShelf = async () => {
    if (nameInput.trimStart() == "") return
    if (nameInput.length > 50) return

    let shelfName = sanitize(nameInput)
    // trim white space off start and end
    shelfName.trimStart()
    shelfName.trimEnd()

    let description = sanitize(descriptionInput)

    // create shelf on firebase
    await updateShelf({
      shelfData: {
        name: shelfName,
        description
      },
      shelfId: selectedShelfInfo.id,
    })

    setSelectedShelfInfo({
      ...selectedShelfInfo,
      name: shelfName,
      description
    })

    setIsUpdateShelfModal(false)
  }

  const handleDeleteShelf = () => setIsDeleteModal(true)

  return (
    <>
      <StandardModal
        title="Update Shelf"
        setIsModelOpen={setIsUpdateShelfModal}
      >
        <div className={styles.container}>
          <input type="text" placeholder={"name"} onChange={handleShelfNameChange} value={nameInput} className={styles.input} />
          <textarea className={styles.textArea} value={descriptionInput} onChange={handleDescriptionInputChange} placeholder={"description"} rows={5} maxLength={500} />

          <div className={styles.buttonsContainer}>
            <div className={styles.update} onClick={handleUpdateShelf}>+ update</div>
            <div className={styles.delete} onClick={handleDeleteShelf}>x delete</div>
          </div>
        </div>
      </StandardModal>

      {
        isDeleteModal ? <DeleteShelfModal setIsDeleteModal={setIsDeleteModal} /> : null
      }

    </>
  )
}
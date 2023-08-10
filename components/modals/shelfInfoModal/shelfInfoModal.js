import { useStore } from "@/utils/store";
import styles from "./shelfInfoModal.module.sass"
import { updateShelf, createShelf } from "@/utils/firestore";
import { useEffect, useState } from "react";
import { capitalizeFirstLetter } from "@/utils/helpers";
import { StandardModal } from "../modalTemplates";
import DeleteShelfModal from "../deleteModals/deleteShelfModal/deleteShelfModal";

export default function ShelfInfoModal({ type }) {

  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)
  const setIsShelfInfoModal = useStore((state) => state.setIsShelfInfoModal)

  const userAllShelves = useStore((state) => state.userAllShelves)
  const setUserAllShelves = useStore((state) => state.setUserAllShelves)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const [isDeleteModal, setIsDeleteModal] = useState(false)


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


  useEffect(() => {
    if (type === "update" && selectedShelfInfo) {
      setNameInput(selectedShelfInfo.name)
      setDescriptionInput(selectedShelfInfo.description)
    }
  }, [])

  const handleCreateUpdateShelf = async () => {
    if (nameInput.trimStart() == "") return
    if (nameInput.length > 50) return

    let shelfName = nameInput
    // trim white space off start and end
    shelfName.trimStart()
    shelfName.trimEnd()

    let description = descriptionInput
    // let description = sanitize(descriptionInput)

    let shelfData = {
      name: shelfName,
      description,
    }

    if (type === "update") {

      // update shelf on firebase
      await updateShelf({
        shelfData,
        shelfId: selectedShelfInfo.id,
      })

      setSelectedShelfInfo({
        ...selectedShelfInfo,
        ...shelfData,
      })

    } else if (type === "create") {
      // create shelf on firebase
      const shelfId = await createShelf({
        shelfData: {
          name: shelfName,
          description
        }, userId: loggedInUser.id,
      })
      setUserAllShelves([...userAllShelves, { id: shelfId, name: shelfName }])
    }

    setIsShelfInfoModal(false)

  }

  const handleDeleteShelf = () => setIsDeleteModal(true)

  return (
    <>
      <StandardModal
        title={`${capitalizeFirstLetter(type)} Shelf`}
        setIsModelOpen={setIsShelfInfoModal}
      >
        <div className={styles.container}>
          <input type="text" placeholder={"name"} onChange={handleShelfNameChange} value={nameInput} className={styles.input} />
          <textarea className={styles.textArea} value={descriptionInput} onChange={handleDescriptionInputChange} placeholder={"description"} rows={5} maxLength={500} />

          <div className={styles.buttonsContainer}>
            <div className={styles.createUpdate} onClick={handleCreateUpdateShelf}>+ {type}</div>
            {
              type === "update" ?
                <div className={styles.delete} onClick={handleDeleteShelf}>x delete</div>
                : null
            }
          </div>
        </div>
      </StandardModal>

      {
        isDeleteModal ? <DeleteShelfModal setIsDeleteModal={setIsDeleteModal} /> : null
      }

    </>
  )
}
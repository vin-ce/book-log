import { useEffect, useRef, useState } from "react"
import DeleteRoomModal from "../deleteModals/deleteRoomModal/deleteRoomModal"
import styles from "./roomInfoModal.module.sass"
import { StandardModal } from "../modalTemplates"
import sanitize from "sanitize-html"
import { createRoom, updateRoom } from "@/utils/realtime"
import { useStore } from "@/utils/store"
import { capitalizeFirstLetter } from "@/utils/helpers"
import { useRouter } from "next/router"

export default function RoomInfoModal({ type, setIsRoomInfoModal }) {

  const loggedInUser = useStore((state) => state.loggedInUser)
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const [nameInput, setNameInput] = useState('')
  const nameInputRef = useRef(null)
  const handleNameInputChange = e => {
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

  const [coverImageUrlInput, setCoverImageUrlInput] = useState('')
  const coverImageUrlInputRef = useRef(null)
  const handleCoverImageUrlInput = (e) => { setCoverImageUrlInput(e.target.value.trimStart()) }



  useEffect(() => {
    if (type === "update" && selectedRoomInfo) {
      setNameInput(selectedRoomInfo.name)
      setDescriptionInput(selectedRoomInfo.description)
      setCoverImageUrlInput(selectedRoomInfo.coverImageUrl)
    }
  }, [])


  const router = useRouter()

  const handleCreateUpdateRoom = async () => {
    let isFormInvalid = false

    let name = nameInput
    name.trimEnd()

    if (!name) {
      nameInputRef.current.placeholder = '⚠️ name required'
      isFormInvalid = true
    }

    let coverImageUrl = coverImageUrlInput
    coverImageUrl.trimEnd()

    if (coverImageUrl)
      if (!isUrl(coverImageUrl)) {
        setCoverImageUrlInput('')
        coverImageUrlInputRef.current.placeholder = '⚠️ invalid url'
        isFormInvalid = true
      }


    let description = sanitize(descriptionInput)

    if (isFormInvalid) return
    else {

      let roomData = {
        name,
        description,
        coverImageUrl,
        creatorId: loggedInUser.id,
      }

      if (type === "create") {
        const roomId = await createRoom({
          userId: loggedInUser.id,
          roomData,
        })

        router.push(`/rooms/${roomId}`)

      } else if (type === "update") {

        await updateRoom({
          roomId: selectedRoomInfo.roomId,
          roomData,
        })

        setIsRoomInfoModal(false)
        // router.reload()
      }

    }
  }


  return (
    <>
      <StandardModal
        title={`${capitalizeFirstLetter(type)} Room`}
        setIsModelOpen={setIsRoomInfoModal}
      >
        <div className={styles.container}>
          <input ref={nameInputRef} type="text" placeholder="name (*)" onChange={handleNameInputChange} value={nameInput} className={styles.input} />

          <textarea className={styles.textArea} value={descriptionInput} onChange={handleDescriptionInputChange} placeholder={"description"} rows={5} maxLength={3000} />

          <input ref={coverImageUrlInputRef} type="text" placeholder="cover image url" onChange={handleCoverImageUrlInput} value={coverImageUrlInput} className={styles.input} />

          <div className={styles.buttonsContainer}>
            <div className={styles.createUpdate} onClick={handleCreateUpdateRoom}>+ {type}</div>
            {
              type === "update" ?
                <div className={styles.delete} onClick={() => setIsDeleteModal(true)}>x delete</div>
                : null
            }
          </div>
        </div>
      </StandardModal>

      {
        isDeleteModal ? <DeleteRoomModal setIsDeleteModal={setIsDeleteModal} /> : null
      }

    </>
  )
}



function isUrl(str) {
  const linkRegex = /^(https?:\/\/)?([a-z0-9\-]+\.)*[a-z0-9\-]+(\.[a-z]{2,})(:[0-9]+)?(\/.*)?$/i;
  return linkRegex.test(str);
}
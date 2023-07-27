import styles from "./createMaterialModal.module.sass"

import { StandardModal } from "../../modalTemplates"
import { useStore } from "@/utils/store"
import { useRef, useState } from "react"
import sanitize from "sanitize-html"
import { createMaterial } from "@/utils/firestore"
import { useRouter } from "next/router"

export default function CreateMaterialModal() {


  const loggedInUser = useStore((state) => state.loggedInUser)
  const setIsCreateMaterialModal = useStore((state) => state.setIsCreateMaterialModal)

  const router = useRouter()


  const [titleInput, setTitleInput] = useState('')
  const handleTitleInputChange = (e) => setTitleInput(e.target.value.trimStart())
  const titleInputRef = useRef(null)

  const [authorsInput, setAuthorsInput] = useState('')
  const handleAuthorsInput = (e) => { setAuthorsInput(e.target.value.trimStart()) }
  const authorsInputRef = useRef(null)

  const [selectedStatus, setSelectedStatus] = useState(null)
  const onClickStatus = (e) => {
    const id = e.target.id
    const parts = id.split("_")
    const status = parts[parts.length - 1]

    if (status === selectedStatus) return

    setSelectedStatus(status)

    document.querySelector(`.${styles.active}`).classList.remove(styles.active)
    e.target.classList.add(styles.active)
  }

  const [linkInput, setLinkInput] = useState('')
  const handleLinkInputChange = (e) => { setLinkInput(e.target.value.trimStart()) }
  const linkInputRef = useRef(null)

  const [coverImageLinkInput, setCoverImageLinkInput] = useState('')
  const handleCoverImageLinkInput = (e) => { setCoverImageLinkInput(e.target.value.trimStart()) }
  const coverImageLinkInputRef = useRef(null)

  const [dateInput, setDateInput] = useState('')
  const handleDateInput = (e) => { setDateInput(e.target.value.trimStart()) }
  const dateInputRef = useRef(null)

  const [descriptionInput, setDescriptionInput] = useState('')

  const handleDescriptionInputChange = (e) => setDescriptionInput(e.target.value.trimStart())


  const handleCreateMaterial = async () => {
    let isFormInvalid = false

    let title = titleInput
    title.trimEnd()

    if (!title) {
      titleInputRef.current.placeholder = '⚠️ title required'
      isFormInvalid = true
    }

    let authors = authorsInput
    let authorsArr
    authors.trimEnd()

    if (!authors) {
      titleInputRef.current.placeholder = '⚠️ authors required'
      isFormInvalid = true
    } else {
      authorsArr = authors.split(',').map(part => part.trim())
    }

    let status = selectedStatus

    let link = linkInput
    link.trimEnd()

    if (link)
      if (!isLink(link)) {
        setLinkInput('')
        linkInputRef.current.placeholder = '⚠️ invalid link'
        isFormInvalid = true
      }

    let coverImageLink = coverImageLinkInput
    coverImageLink.trimEnd()

    if (coverImageLink)
      if (!isLink(coverImageLink)) {
        setCoverImageLinkInput('')
        coverImageLinkInputRef.current.placeholder = '⚠️ invalid link'
        isFormInvalid = true
      }

    let date = dateInput
    date.trimEnd()

    if (date)
      if (!isValidDateFormat(date)) {
        setDateInput('')
        dateInputRef.current.placeholder = '⚠️ dd/mm/yyyy or mm/yyyy or yyyy'
        isFormInvalid = true
      }

    let description = sanitize(descriptionInput)

    if (isFormInvalid) return
    else {

      const materialId = await createMaterial({
        userId: loggedInUser.id,
        materialData: {
          title,
          authors: authorsArr,
          status,
          link,
          imageUrl: coverImageLink,
          publishedDate: date,
          description,
          type: "material",
        },
        status: selectedStatus
      })

      router.push(`/material/${materialId}/${loggedInUser.username}`)
    }
  }

  return (
    <StandardModal
      title={"Create Material"}
      setIsModelOpen={setIsCreateMaterialModal}
    >
      <div className={styles.container}>

        <input ref={titleInputRef} type="text" placeholder="title (required)" onChange={handleTitleInputChange} value={titleInput} className={styles.input} />

        <input ref={authorsInputRef} type="text" placeholder="author 1, author 2 (required)" onChange={handleAuthorsInput} value={authorsInput} className={styles.input} />

        <div className={styles.statusContainer}>
          <div onClick={onClickStatus} className={styles.active} id="create-modal_status_toRead">to read</div>
          <div onClick={onClickStatus} id="create-modal_status_reading">reading</div>
          <div onClick={onClickStatus} id="create-modal_status_read">read</div>
        </div>

        <input ref={linkInputRef} type="text" placeholder="link" onChange={handleLinkInputChange} value={linkInput} className={styles.input} />

        <input ref={coverImageLinkInputRef} type="text" placeholder="cover image link" onChange={handleCoverImageLinkInput} value={coverImageLinkInput} className={styles.input} />


        <input ref={dateInputRef} type="text" placeholder="date published, dd/mm/yyyy" onChange={handleDateInput} value={dateInput} className={styles.input} />

        <textarea className={styles.textArea} value={descriptionInput} onChange={handleDescriptionInputChange} placeholder={"description"} rows={5} maxLength={500} />

        <div className={styles.createButton} onClick={handleCreateMaterial}>+ create</div>

      </div>
    </StandardModal>
  )
}


function isLink(str) {
  const linkRegex = /^(https?:\/\/)?([a-z0-9\-]+\.)*[a-z0-9\-]+(\.[a-z]{2,})(:[0-9]+)?(\/.*)?$/i;
  return linkRegex.test(str);
}

function isValidDateFormat(str) {
  // Regular expression for 'dd/mm/yyyy', 'mm/yyyy', or 'yyyy' formats
  const dateRegex = /^(?:(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/\d{4})$|^(0?[1-9]|1[0-2])\/\d{4}$|^\d{4}$/;
  return dateRegex.test(str);
}

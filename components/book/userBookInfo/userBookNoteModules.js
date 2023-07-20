import { useStore } from "@/utils/store"
import { useRef, useState } from "react"

import styles from "./userBookNoteModules.module.sass"

import TweetEmbed from "react-tweet-embed"
import ContentEditable from "react-contenteditable"
import sanitize from "sanitize-html"


export function TweetNote({ tweetId }) {
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)
  const [buttonsEl, setButtonsEl] = useState(null)
  const [dateEl, setDateEl] = useState(null)

  const onClickPin = () => {

  }

  const toggleOptions = () => {
    if (isAuthorizedForUserBook) {
      if (buttonsEl) {
        setDateEl(null)
        setButtonsEl(null)
      } else {
        setDateEl(
          <div className={styles.date}>Sep 12 2022</div>
        )
        setButtonsEl(
          <div className={styles.noteButtonsContainer}>
            <span className={styles.button} onClick={onClickPin}>!</span>

            <span className={styles.button}>x</span>
          </div>
        )
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {dateEl}
        <div className={styles.dot} onClick={toggleOptions} />
        {buttonsEl}
      </div>
      <TweetEmbed tweetId={tweetId} options={{ conversation: "none", dnt: "true" }} />
    </div>
  )

}


export function TextNote() {
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)
  const [buttonsEl, setButtonsEl] = useState(null)
  const [dateEl, setDateEl] = useState(null)

  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const [textContent, setTextContent] = useState("i said this exact thing like an hour or two ago!!! i was reflecting on how i want so much more of this often and that surprised me - maybe im not an introvert after all but that my social energy was always burnt in foreign lands instead of home where it only grows brighter")

  const [isDisabled, setIsDisabled] = useState(true)
  const textElRef = useRef(null)

  const handleOnTextChange = (e) => {
    setTextContent(sanitize(e.target.value))
  }


  const onClickCompleteEdit = () => {
    textElRef.current.classList.remove(styles.activeText)
    setIsDisabled(true)
    setButtonsEl(null)
  }

  const onClickEdit = () => {
    setIsDisabled(false)
    textElRef.current.classList.add(styles.activeText)
    setButtonsEl(
      <div className={styles.noteButtonsContainer}>
        <span className={styles.button} onClick={onClickCompleteEdit}>save edit</span>
      </div>
    )
  }

  const onClickDelete = () => {
    setIsDeleteModal(true)
  }

  const onClickPin = () => {

  }

  const onClickDot = () => {
    if (buttonsEl) {
      setButtonsEl(null)
      setDateEl(null)
      setIsDeleteModal(null)
    } else {
      setButtonsEl(
        <div className={styles.noteButtonsContainer}>
          <span className={styles.button} onClick={onClickPin}>!</span>
          <span className={styles.button} onClick={onClickEdit}>+</span>
          <span className={styles.button} onClick={onClickDelete}>x</span>
        </div>
      )
    }
  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.dot} onClick={onClickDot} />
        {buttonsEl}
      </div>
      <ContentEditable
        innerRef={textElRef}
        html={textContent}
        disabled={isDisabled}
        onChange={handleOnTextChange}
      />
      {
        isDeleteModal ? <ConfirmDeleteModal setIsDeleteModal={setIsDeleteModal} /> : null
      }
    </div>
  )
}

function ConfirmDeleteModal({ setIsDeleteModal }) {

  const onClickYes = () => {

    setIsDeleteModal(false)
  }

  const onClickCancel = () => {
    setIsDeleteModal(false)
  }

  return (
    <div className={styles.deleteModalContainer}>
      <div className={styles.deleteModalHeader}>Delete Note?</div>
      <div className={styles.deleteModalOptions}>
        <div className={styles.yes} onClick={onClickYes}>yes</div>
        <div className={styles.cancel} onClick={onClickCancel}>cancel</div>
      </div>
    </div>
  )
}
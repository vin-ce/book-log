import { useStore } from "@/utils/store"
import { useEffect, useRef, useState } from "react"

import styles from "./userBookNoteModules.module.sass"

import TweetEmbed from "react-tweet-embed"
import ContentEditable from "react-contenteditable"
import sanitizeHtml from "sanitize-html"
import { addPinnedNote, deleteNote, editTextNote, removePinnedNote } from "@/utils/firestore"
import { useFreshRef } from "@/hooks/useFreshRef"


function NoteTemplate({ children, createdTimestampSeconds, id, pinned, extraButtons, externalButtonsElRef, setExternalButtonsEl, hideHeaderPartsFuncRef }) {

  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)

  let [internalButtonsElRef, setInternalButtonsEl] = useFreshRef(null)

  // this is so textNotes can set the buttons from outside of this component
  if (externalButtonsElRef) {
    internalButtonsElRef = externalButtonsElRef
    setInternalButtonsEl = setExternalButtonsEl
  }

  const [dateEl, setDateEl] = useState(null)

  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)


  const onClickPin = async () => {

    const tempNotesData = [...userBookNotes]

    const currentIndex = tempNotesData.findIndex(obj => obj.id === id)
    const pinnedNoteData = tempNotesData[currentIndex]

    if (pinned) {
      // find it, set pinned = false, can leave it there since it sorts itself out
      await removePinnedNote({ bookId: selectedBookId, userId: selectedBookUserId, noteId: id })

      pinnedNoteData.pinned = false

    } else {
      // find it, set pinned = true, shift it to top
      await addPinnedNote({ bookId: selectedBookId, userId: selectedBookUserId, noteId: id })

      pinnedNoteData.pinned = true

      tempNotesData.splice(currentIndex, 1)
      tempNotesData.unshift(pinnedNoteData)
    }

    console.log("new", JSON.stringify(tempNotesData))
    console.log("old", JSON.stringify(userBookNotes))

    setUserBookNotes([...tempNotesData])
  }

  const onClickDelete = () => setIsDeleteModal(true)

  const hideHeaderParts = () => {
    setDateEl(null)
    internalButtonsElRef.current = null
  }

  if (hideHeaderPartsFuncRef) hideHeaderPartsFuncRef.current = hideHeaderParts

  const toggleOptions = () => {
    if (isAuthorizedForUserBook) {
      if (internalButtonsElRef.current) {
        hideHeaderParts()
      } else {
        setDateEl(
          <div className={styles.date}>{secondsToDate(createdTimestampSeconds)}</div>
        )
        setInternalButtonsEl(
          <div className={styles.noteButtonsContainer}>
            {extraButtons}
            <span className={styles.button} onClick={onClickPin}>!</span>
            <span className={styles.button} onClick={onClickDelete}>x</span>
          </div>
        )
      }
    }
  }

  useEffect(() => {
    if (pinned) document.getElementById(`${id}-dot`).classList.add(styles.pinned)
  }, [pinned])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {dateEl}
        {
          isAuthorizedForUserBook ?
            <div id={`${id}-dot`} className={[styles.dot, styles.active].join(' ')} onClick={toggleOptions} />
            :
            <div id={`${id}-dot`} className={styles.dot} />
        }
        {internalButtonsElRef.current}
      </div>
      {children}
      {
        isDeleteModal ? <ConfirmDeleteModal setIsDeleteModal={setIsDeleteModal} id={id} /> : null
      }
    </div>
  )
}


// ---------------
// TWEET NOTE

export function TweetNote({ tweetId, createdTimestampSeconds, id, pinned }) {

  return (
    <NoteTemplate
      id={id}
      pinned={pinned}
      createdTimestampSeconds={createdTimestampSeconds}
    >
      <TweetEmbed tweetId={tweetId} options={{ conversation: "none", dnt: "true" }} />
    </NoteTemplate>
  )
}

// --------------
// TEXT NOTE

export function TextNote({ content, createdTimestampSeconds, id, pinned }) {

  const [textContent, setTextContent] = useFreshRef(content)

  const [isDisabled, setIsDisabled] = useState(true)
  const textElRef = useRef(null)

  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const handleOnTextChange = (e) => {
    setTextContent(sanitizeHtml(e.target.value))
  }

  const [buttonsElRef, setButtonsEl] = useFreshRef(null)

  const hideHeaderPartsFuncRef = useRef(null)

  const onClickCompleteEdit = async () => {
    textElRef.current.classList.remove(styles.activeText)
    setIsDisabled(true)
    setButtonsEl(null)
    hideHeaderPartsFuncRef.current()

    await editTextNote({ bookId: selectedBookId, userId: selectedBookUserId, noteId: id, content: textContent.current })
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

  return (
    <NoteTemplate
      id={id}
      pinned={pinned}
      createdTimestampSeconds={createdTimestampSeconds}
      extraButtons={<span className={styles.button} onClick={onClickEdit}>+</span>}
      externalButtonsElRef={buttonsElRef}
      setExternalButtonsEl={setButtonsEl}
      hideHeaderPartsFuncRef={hideHeaderPartsFuncRef}
    >
      <ContentEditable
        innerRef={textElRef}
        html={textContent.current}
        disabled={isDisabled}
        onChange={handleOnTextChange}
      />
    </NoteTemplate>
  )
}


// -----------------
// DELETE MODAL

function ConfirmDeleteModal({ setIsDeleteModal, id }) {
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const onClickYes = async () => {
    // delete from firebase
    await deleteNote({ bookId: selectedBookId, userId: selectedBookUserId, noteId: id })

    // removes object from data state
    const toDeleteObj = userBookNotes.find(elData => elData.id === id)
    const toDeleteObjIndex = userBookNotes.indexOf(toDeleteObj)
    const userBookNotesCopy = [...userBookNotes]
    userBookNotesCopy.splice(toDeleteObjIndex, 1)
    setUserBookNotes(userBookNotesCopy)

    // close modal
    setIsDeleteModal(false)
  }

  const onClickCancel = () => setIsDeleteModal(false)

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

// ----------------
// HELPER FUNC

function secondsToDate(seconds) {
  const date = new Date(seconds * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

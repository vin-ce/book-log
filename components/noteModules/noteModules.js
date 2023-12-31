import { useStore } from "@/utils/store"
import { useEffect, useRef, useState } from "react"

import styles from "./noteModules.module.sass"

import TweetEmbed from "react-tweet-embed"
import ContentEditable from "react-contenteditable"
import sanitizeHtml from "sanitize-html"
import { addPinnedNote, editTextNote, removePinnedNote } from "@/utils/firestore"
import { useFreshRef } from "@/hooks/useFreshRef"
import DeleteNoteModal from "../modals/deleteModals/deleteNoteModal/deleteNoteModal"
import { formatDateFromSeconds } from "@/utils/helpers"
import DeleteRoomNoteModal from "../modals/deleteModals/deleteRoomNoteModal/deleteRoomNoteModal"


function NoteTemplate({ children, createdTimestampSeconds, id, pinned, extraButtons, externalButtonsElRef, setExternalButtonsEl }) {

  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  let [internalButtonsElRef, setInternalButtonsEl] = useFreshRef(null)

  // this is so textNotes can set the buttons from outside of this component
  if (externalButtonsElRef) {
    internalButtonsElRef = externalButtonsElRef
    setInternalButtonsEl = setExternalButtonsEl
  }

  const [isDeleteModal, setIsDeleteModal] = useState(false)

  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const [userBookNotesFresh, setUserBookNotesFresh] = useFreshRef(userBookNotes, setUserBookNotes)

  useEffect(() => {
    if (userBookNotes) setUserBookNotesFresh(userBookNotes)
  }, [userBookNotes])

  const onClickPin = async () => {

    const tempNotesData = [...userBookNotesFresh.current]

    const currentIndex = tempNotesData.findIndex(obj => obj.id === id)
    const pinnedNoteData = tempNotesData[currentIndex]

    if (pinnedNoteData.pinned) {

      await removePinnedNote({ bookId: selectedBookId, userId: selectedUserId, noteId: id })

      pinnedNoteData.pinned = false

      tempNotesData.splice(currentIndex, 1)
      // finds first spot where it's not pinned
      const newIndex = tempNotesData.findIndex(obj => !obj.pinned)
      tempNotesData.splice(newIndex, 0, pinnedNoteData)

    } else {
      // find it, set pinned = true, shift it to top
      await addPinnedNote({ bookId: selectedBookId, userId: selectedUserId, noteId: id })

      pinnedNoteData.pinned = true

      tempNotesData.splice(currentIndex, 1)
      tempNotesData.unshift(pinnedNoteData)
    }

    setUserBookNotesFresh([...tempNotesData])
  }

  const onClickDelete = () => setIsDeleteModal(true)

  const toggleOptions = () => {
    if (isAuthorizedForSelectedUser) {
      if (internalButtonsElRef.current) {
        setInternalButtonsEl(null)
      } else {
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
    else document.getElementById(`${id}-dot`).classList.remove(styles.pinned)
  }, [pinned])

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          {isAuthorizedForSelectedUser && internalButtonsElRef.current ?
            <div className={styles.date}>{formatDateFromSeconds(createdTimestampSeconds)}</div> : null
          }
          {
            isAuthorizedForSelectedUser ?
              <div id={`${id}-dot`} className={[styles.dot, styles.authorized, styles.active].join(' ')} onClick={toggleOptions} />
              :
              <div id={`${id}-dot`} className={styles.dot} />
          }
          {internalButtonsElRef.current ? internalButtonsElRef.current : null}
        </div>
        {children}
      </div>
      {
        isDeleteModal ? <DeleteNoteModal setIsDeleteModal={setIsDeleteModal} id={id} /> : null
      }
    </>
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

  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const handleOnTextChange = (e) => {
    setTextContent(sanitizeHtml(e.target.value))
  }

  const [buttonsElRef, setButtonsEl] = useFreshRef(null)


  const onClickCompleteEdit = async () => {
    textElRef.current.classList.remove(styles.activeText)
    setIsDisabled(true)
    setButtonsEl(null)

    await editTextNote({ bookId: selectedBookId, userId: selectedUserId, noteId: id, content: textContent.current })

    // find note in notesData
    // update content in state
    const index = userBookNotes.findIndex(note => note.id === id)
    const userBookNotesCopy = [...userBookNotes]
    userBookNotesCopy[index].content = textContent.current
    setUserBookNotes(userBookNotesCopy)
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


// ================
// SHELF NOTES



function ShelfNoteTemplate({ children, id, pinned, handleUpdatePinnedNote, createdTimestampSeconds }) {

  let [hasButtons, setHasButtons] = useState(null)
  let [isPinned, setIsPinned] = useFreshRef(pinned)

  const onClickPin = async () => {
    if (isPinned.current) handleUpdatePinnedNote({ type: "remove", id })
    else handleUpdatePinnedNote({ type: "add", id })

    setIsPinned(!isPinned.current)
    setDotPinnedStyles()
  }

  const toggleOptions = () => setHasButtons(!hasButtons)

  function setDotPinnedStyles() {
    if (isPinned.current) document.getElementById(`${id}-dot`).classList.add(styles.pinned)
    else document.getElementById(`${id}-dot`).classList.remove(styles.pinned)
  }

  useEffect(() => {
    setIsPinned(pinned)
    setDotPinnedStyles(pinned)
  }, [pinned])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {hasButtons ?
          <div className={styles.date}>{formatDateFromSeconds(createdTimestampSeconds)}</div> : null
        }

        <div id={`${id}-dot`} className={[styles.dot, styles.active].join(' ')} onClick={toggleOptions} />

        {hasButtons ?
          <div className={styles.noteButtonsContainer}>
            <span className={styles.button} onClick={onClickPin}>
              {isPinned.current ? `! unpin` : `! pin`}
            </span>
          </div>
          : null}
      </div>

      {children}

    </div>

  )
}


export function ShelfTweetNote({ tweetId, id, createdTimestampSeconds, handleUpdatePinnedNote, pinned }) {

  return (
    <ShelfNoteTemplate
      id={id}
      pinned={pinned}
      createdTimestampSeconds={createdTimestampSeconds}
      handleUpdatePinnedNote={handleUpdatePinnedNote}
    >
      <TweetEmbed tweetId={tweetId} options={{ conversation: "none", dnt: "true" }} />
    </ShelfNoteTemplate>
  )
}


export function ShelfTextNote({ content, createdTimestampSeconds, id, pinned, handleUpdatePinnedNote }) {

  return (
    <ShelfNoteTemplate
      id={id}
      pinned={pinned}
      createdTimestampSeconds={createdTimestampSeconds}
      handleUpdatePinnedNote={handleUpdatePinnedNote}
    >
      {content}
    </ShelfNoteTemplate>
  )
}


// ===============
// ROOM NOTES

function RoomNoteTemplate({ children, sectionId, noteId, createdTimestampSeconds, isAuthorized }) {

  let [hasButtons, setHasButtons] = useState(null)
  let [isDeleteModal, setIsDeleteModal] = useState(false)


  const toggleOptions = () => {
    if (!isAuthorized) return
    setHasButtons(!hasButtons)
  }

  const onClickDelete = () => setIsDeleteModal(true)

  let dotClasses = styles.dot
  if (isAuthorized) dotClasses = [dotClasses, styles.authorized].join(' ')

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          {hasButtons ?
            <div className={styles.date}>{formatDateFromSeconds(createdTimestampSeconds)}</div> : null
          }

          <div className={dotClasses} onClick={toggleOptions} />

          {hasButtons ?
            <div className={styles.noteButtonsContainer}>
              <span className={styles.button} onClick={onClickDelete}>x</span>
            </div>
            : null}
        </div>

        {children}

      </div>

      {
        isDeleteModal ? <DeleteRoomNoteModal setIsDeleteModal={setIsDeleteModal} sectionId={sectionId} noteId={noteId} /> : null
      }
    </>

  )
}

export function RoomTextNote({ content, createdTimestampSeconds, sectionId, noteId, isAuthorized }) {

  return (
    <RoomNoteTemplate
      sectionId={sectionId}
      noteId={noteId}
      createdTimestampSeconds={createdTimestampSeconds}
      isAuthorized={isAuthorized}
    >
      {content}
    </RoomNoteTemplate>
  )
}


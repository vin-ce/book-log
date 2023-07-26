import { useStore } from "@/utils/store"
import styles from "./createNoteModals.module.sass"
import { StandardModal } from "../modalTemplates"
import { useEffect, useRef, useState } from "react"
import { createNote } from "@/utils/firestore"
import sanitizeHtml from "sanitize-html"

export function CreateTweetNoteModal() {
  const setIsCreateTweetNoteModal = useStore((state) => state.setIsCreateTweetNoteModal)
  const selectedBookId = useStore((state) => state.selectedBookId)
  const selectedUserId = useStore((state) => state.selectedUserId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const inputRef = useRef(null)

  const [tweetInput, setTweetInput] = useState('')
  const handleInputChange = (e) => {
    e.preventDefault()
    let inputString = e.target.value
    setTweetInput(inputString)
  }

  const handleCreateTweetNote = async () => {
    const res = extractTweetId(tweetInput)
    if (res === "error") {
      setTweetInput("")
      inputRef.current.placeholder = "Invalid ID"
    }
    else {
      const tweetNoteData = await createNote({ bookId: selectedBookId, userId: selectedUserId, tweetId: res, type: "tweet" })

      if (userBookNotes) setUserBookNotes([tweetNoteData, ...userBookNotes])
      else setUserBookNotes([tweetNoteData])

      setIsCreateTweetNoteModal(false)
    }
  }

  return (
    <StandardModal
      title={"Create Tweet Note"}
      setIsModelOpen={setIsCreateTweetNoteModal}
    >
      <div className={styles.container}>
        <input ref={inputRef} type="text" placeholder="Tweet url..." onChange={handleInputChange} value={tweetInput} className={styles.input} />
        <div className={styles.createButton} onClick={handleCreateTweetNote}>+ create</div>
      </div>
    </StandardModal>
  )
}

function extractTweetId(tweetUrl) {
  const twitterPattern = /^https?:\/\/twitter\.com\/.*\/status\/(\d+)/;

  if (twitterPattern.test(tweetUrl)) {
    const regex = /\/status\/(\d+)/;
    const match = tweetUrl.match(regex);

    if (match && match[1]) {
      const id = match[1];
      return id
    }
  } else {
    return "error"
  }
}

export function CreateTextNoteModal() {
  const selectedBookId = useStore((state) => state.selectedBookId)
  const selectedUserId = useStore((state) => state.selectedUserId)

  const setIsCreateTextNoteModal = useStore((state) => state.setIsCreateTextNoteModal)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const [textInput, setTextInput] = useState('')
  const [numOfChar, setNumOfChar] = useState(0)

  const handleInputChange = (e) => {
    e.preventDefault()
    let inputString = e.target.value
    setTextInput(inputString)
    setNumOfChar(inputString.length)
  }

  const handleCreateTweetNote = async () => {
    let inputString = sanitizeHtml(textInput)

    const textNoteData = await createNote({ bookId: selectedBookId, userId: selectedUserId, content: inputString, type: "text" })

    if (userBookNotes) setUserBookNotes([textNoteData, ...userBookNotes])
    else setUserBookNotes([textNoteData])

    setIsCreateTextNoteModal(false)
  }

  return (
    <StandardModal
      title={"Create Text Note"}
      setIsModelOpen={setIsCreateTextNoteModal}
      modalClass={styles.modal}
    >
      <div className={styles.createTextNoteContainer}>
        <textarea className={styles.textArea} value={textInput} onChange={handleInputChange} placeholder={"Write a note..."} rows={10} maxLength={500} />
        <div className={styles.footer}>
          <div className={styles.createButton} onClick={handleCreateTweetNote}>+ create</div>
          <div className={styles.characterCount}>{numOfChar}/500</div>
        </div>
      </div>
    </StandardModal>
  )
}
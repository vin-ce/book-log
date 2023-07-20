import { useStore } from "@/utils/store"
import styles from "./createNoteModals.module.sass"
import { StandardModal } from "../modalTemplates"
import { useEffect, useState } from "react"

export function CreateTweetNoteModal() {
  const setIsCreateTweetNoteModal = useStore((state) => state.setIsCreateTweetNoteModal)

  const [tweetInput, setTweetInput] = useState('')
  const handleInputChange = (e) => {
    e.preventDefault()
    let inputString = e.target.value
    setTweetInput(inputString)
  }


  return (
    <StandardModal
      title={"Create Tweet Note"}
      setIsModelOpen={setIsCreateTweetNoteModal}
    >
      <div className={styles.container}>
        <input type="text" placeholder="Tweet url..." onChange={handleInputChange} value={tweetInput} className={styles.input} />
        <div className={styles.createButton}>+ create</div>
      </div>
    </StandardModal>
  )
}

export function CreateTextNoteModal() {
  const setIsCreateTextNoteModal = useStore((state) => state.setIsCreateTextNoteModal)

  const [textInput, setTextInput] = useState('')
  const [numOfChar, setNumOfChar] = useState(0)
  const handleInputChange = (e) => {
    e.preventDefault()
    let inputString = e.target.value
    setTextInput(inputString)
    setNumOfChar(inputString.length)
  }

  return (
    <StandardModal
      title={"Create Text Note"}
      setIsModelOpen={setIsCreateTextNoteModal}
    >
      <div className={styles.createTextNoteContainer}>
        <textarea className={styles.textArea} value={textInput} onChange={handleInputChange} placeholder={"Write a note..."} rows={10} maxLength={500} />
        <div className={styles.footer}>
          <div className={styles.createButton}>+ create</div>
          <div className={styles.characterCount}>{numOfChar}/500</div>
        </div>
      </div>
    </StandardModal>
  )
}
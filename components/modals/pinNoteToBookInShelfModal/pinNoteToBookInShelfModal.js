import { useStore } from "@/utils/store"
import { StandardModal } from "../modalTemplates"
import styles from "./pinNoteToBookInShelfModal.module.sass"
import { ShelfTextNote, ShelfTweetNote } from "@/components/noteModules/noteModules"
import React, { useEffect, useState } from "react"
import { pinBookNoteInShelf, unpinBookNoteInShelf } from "@/utils/firestore"

export default function PinNoteToBookInShelfModal({ setIsPinNoteToBookInShelfModal, bookData, pinnedNoteData, setPinnedNoteData }) {

  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)

  const [test, setTest] = useState(true)

  console.log("pinned note data", pinnedNoteData)

  const handleUpdatePinnedNote = async ({ type, id }) => {

    if (type === "remove") {

      // UPDATE IN FIREBASE
      await unpinBookNoteInShelf({ bookId: bookData.id, shelfId: selectedShelfInfo.id })
      setPinnedNoteData(null)

    } else if (type === "add") {

      const newPinnedNoteData = bookData.notes.find(note => note.id === id)

      // UPDATE IN FIREBASE
      await pinBookNoteInShelf({ bookId: bookData.id, shelfId: selectedShelfInfo.id, noteData: newPinnedNoteData })
      setPinnedNoteData(newPinnedNoteData)

    }
    setTest(!test)
  }

  const [notesElArr, setNotesElArr] = useState(null)

  useEffect(() => {

    const elArr = []

    bookData.notes.forEach((note) => {

      let isPinned
      // console.log('note', )
      if (pinnedNoteData) isPinned = (note.id === pinnedNoteData.id)

      switch (note.type) {
        case "tweet": {
          elArr.push(
            <React.Fragment key={`pin-modal_${note.id}`}>
              <ShelfTweetNote
                tweetId={note.tweetId}
                id={note.id}
                createdTimestampSeconds={note.createdTimestamp.seconds}
                handleUpdatePinnedNote={handleUpdatePinnedNote}
                pinned={isPinned}
              />
            </React.Fragment>
          )
          break
        }

        case "text": {
          elArr.push(
            <React.Fragment key={`pin-modal_${note.id}`}>
              <ShelfTextNote
                content={note.content}
                id={note.id}
                createdTimestampSeconds={note.createdTimestamp.seconds}
                handleUpdatePinnedNote={handleUpdatePinnedNote}
                pinned={isPinned}
              />
            </React.Fragment>
          )
          break
        }
      }
    })

    console.log("re setting", elArr)
    setNotesElArr(elArr)

  }, [bookData.notes, pinnedNoteData, test])



  return (
    <StandardModal
      title={'Pin Note'}
      setIsModelOpen={setIsPinNoteToBookInShelfModal}
      modalClass={styles.modal}
    >
      <div className={styles.notesGrid}>
        {notesElArr}
      </div>
    </StandardModal>
  )
}
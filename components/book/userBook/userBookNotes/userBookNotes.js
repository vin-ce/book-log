import { useStore } from "@/utils/store"
import styles from "./userBookNotes.module.sass"
import { TextNote, TweetNote } from "./subComponents/userBookNoteModules"
import { CreateTextNoteModal, CreateTweetNoteModal } from "@/components/modals/createNoteModals/createNoteModals"
import React, { useEffect, useState } from "react"


export default function UserBookNotes() {

  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  const userBookNotes = useStore((state) => state.userBookNotes)

  const isCreateTextNoteModal = useStore((state) => state.isCreateTextNoteModal)
  const setIsCreateTextNoteModal = useStore((state) => state.setIsCreateTextNoteModal)

  const isCreateTweetNoteModal = useStore((state) => state.isCreateTweetNoteModal)
  const setIsCreateTweetNoteModal = useStore((state) => state.setIsCreateTweetNoteModal)

  const onClickCreateTweetNote = () => setIsCreateTweetNoteModal(true)
  const onClickCreateTextNote = () => setIsCreateTextNoteModal(true)

  const [userBookNotesElArr, setUserBookNotesElArr] = useState(null)
  const [pinnedUserBookNotesElArr, setPinnedUserBookNotesElArr] = useState(null)

  useEffect(() => {
    if (userBookNotes) {

      const pinnedElArr = []
      const elArr = []
      userBookNotes.forEach(note => {
        if (note.type === "tweet") {
          if (note.pinned) {
            pinnedElArr.push(
              <React.Fragment key={note.id}>
                <TweetNote tweetId={note.tweetId} createdTimestampSeconds={note.createdTimestamp.seconds} id={note.id} pinned={true} />
              </React.Fragment>
            )
          } else {
            elArr.push(
              <React.Fragment key={note.id}>
                <TweetNote tweetId={note.tweetId} createdTimestampSeconds={note.createdTimestamp.seconds} id={note.id} />
              </React.Fragment>
            )
          }
        } else if (note.type === "text") {
          if (note.pinned) {
            pinnedElArr.push(
              <React.Fragment key={note.id}>
                <TextNote content={note.content} createdTimestampSeconds={note.createdTimestamp.seconds} id={note.id} pinned={true} />
              </React.Fragment>
            )
          } else {
            elArr.push(
              <React.Fragment key={note.id}>
                <TextNote content={note.content} createdTimestampSeconds={note.createdTimestamp.seconds} id={note.id} />
              </React.Fragment>
            )
          }
        } else {
          console.log("ERROR: something went wrong in notes")
        }
      })

      setPinnedUserBookNotesElArr(pinnedElArr)
      setUserBookNotesElArr(elArr)

    }
  }, [userBookNotes])

  return (
    <>
      {
        !isAuthorizedForSelectedUser && !userBookNotes ? null :
          <div className={styles.container}>
            <div className={styles.header}>
              <div className={styles.label}>sticky notes:</div>
              {
                isAuthorizedForSelectedUser ?
                  <div className={styles.buttonsContainer}>
                    <span className={styles.button} onClick={onClickCreateTweetNote}>+ tweet</span>
                    <span className={styles.button} onClick={onClickCreateTextNote}>+ text</span>
                  </div>
                  :
                  null
              }
            </div>
            <div className={styles.notesGrid}>
              {userBookNotesElArr || pinnedUserBookNotesElArr ?
                <>
                  {pinnedUserBookNotesElArr}
                  {userBookNotesElArr}
                </>
                :
                <div>no notes found</div>}
            </div>
          </div>
      }
      {isCreateTextNoteModal ? <CreateTextNoteModal /> : null}
      {isCreateTweetNoteModal ? <CreateTweetNoteModal /> : null}
    </>
  )
}


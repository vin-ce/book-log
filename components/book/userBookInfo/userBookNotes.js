import { useStore } from "@/utils/store"
import styles from "./userBookNotes.module.sass"
import { TextNote, TweetNote } from "./userBookNoteModules"
import { CreateTextNoteModal, CreateTweetNoteModal } from "@/components/modals/createNoteModals"


export default function UserBookNotes() {

  const loggedInUser = useStore((state) => state.loggedInUser)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)

  const isCreateTextNoteModal = useStore((state) => state.isCreateTextNoteModal)
  const setIsCreateTextNoteModal = useStore((state) => state.setIsCreateTextNoteModal)

  const isCreateTweetNoteModal = useStore((state) => state.isCreateTweetNoteModal)
  const setIsCreateTweetNoteModal = useStore((state) => state.setIsCreateTweetNoteModal)

  const onClickCreateTweetNote = () => setIsCreateTweetNoteModal(true)
  const onClickCreateTextNote = () => setIsCreateTextNoteModal(true)

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.label}>sticky notes:</div>
          {
            isAuthorizedForUserBook ?
              (
                <div className={styles.buttonsContainer}>
                  <span className={styles.button} onClick={onClickCreateTweetNote}>+ tweet</span>
                  <span className={styles.button} onClick={onClickCreateTextNote}>+ text</span>
                </div>
              )
              :
              null
          }
        </div>
        <div className={styles.notesGrid}>
          <TweetNote tweetId={"1677871663893848067"} />
          <TextNote />
          <TweetNote tweetId={"1679271751191089160"} />
          <TextNote />
        </div>
      </div>
      {isCreateTextNoteModal ? <CreateTextNoteModal /> : null}
      {isCreateTweetNoteModal ? <CreateTweetNoteModal /> : null}
    </>
  )
}


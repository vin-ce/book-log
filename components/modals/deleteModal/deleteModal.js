
import { useStore } from "@/utils/store";
import { StandardModal } from "../modalTemplates";
import styles from "./deleteModal.module.sass"
import { deleteNote } from "@/utils/firestore"

export function DeleteNoteModal({ setIsDeleteModal, id }) {

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
    <StandardModal
      title={"Delete Note?"}
      setIsModelOpen={setIsDeleteModal}
    >
      <div className={styles.options}>
        <div className={styles.yes} onClick={onClickYes}>yes</div>
        <div className={styles.cancel} onClick={onClickCancel}>cancel</div>
      </div>
    </StandardModal>
  )
}

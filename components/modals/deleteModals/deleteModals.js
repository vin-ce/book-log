
import { useStore } from "@/utils/store";
import { StandardModal } from "../modalTemplates";
import styles from "./deleteModals.module.sass"
import { deleteNote, deleteShelf, removeBookFromShelf } from "@/utils/firestore"
import { useRouter } from "next/router";


// ================
// DELETE NOTE

export function DeleteNoteModal({ setIsDeleteModal, id }) {

  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)


  const onClickYes = async () => {
    // delete from firebase
    await deleteNote({ bookId: selectedBookId, userId: selectedUserId, noteId: id })

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

// =================
// DELETE SHELF

export function DeleteShelfModal({ setIsDeleteModal }) {

  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)

  const router = useRouter()

  const onClickYes = async () => {
    // delete from firebase
    await deleteShelf(selectedShelfInfo.id)
    // close modal
    setIsDeleteModal(false)
    router.push("/")
  }

  const onClickCancel = () => setIsDeleteModal(false)

  return (
    <StandardModal
      title={"Delete Shelf?"}
      setIsModelOpen={setIsDeleteModal}
    >
      <div className={styles.options}>
        <div className={styles.yes} onClick={onClickYes}>yes</div>
        <div className={styles.cancel} onClick={onClickCancel}>cancel</div>
      </div>
    </StandardModal>
  )
}


// ===========================
// REMOVE BOOK FROM SHELF

export function RemoveBookFromShelfModal({ setIsRemoveBookFromShelfModal, bookId }) {

  const loggedInUser = useStore((state) => state.loggedInUser)

  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)

  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)
  const setSelectedShelfBooksData = useStore((state) => state.setSelectedShelfBooksData)


  const onClickYes = async () => {
    // remove from firebase
    await removeBookFromShelf({ bookId: bookId, shelfId: selectedShelfInfo.id, userId: loggedInUser.id })

    // removes object from data state
    const toDeleteObj = selectedShelfBooksData.find(elData => elData.id === bookId)
    const toDeleteObjIndex = selectedShelfBooksData.indexOf(toDeleteObj)
    const selectedShelfBooksDataCopy = [...selectedShelfBooksData]
    selectedShelfBooksDataCopy.splice(toDeleteObjIndex, 1)
    setSelectedShelfBooksData(selectedShelfBooksDataCopy)

    // close modal
    setIsRemoveBookFromShelfModal(false)
  }

  const onClickCancel = () => setIsRemoveBookFromShelfModal(false)

  return (
    <StandardModal
      title={"Remove Book From Shelf?"}
      setIsModelOpen={setIsRemoveBookFromShelfModal}
    >
      <div className={styles.options}>
        <div className={styles.yes} onClick={onClickYes}>yes</div>
        <div className={styles.cancel} onClick={onClickCancel}>cancel</div>
      </div>
    </StandardModal>
  )
}

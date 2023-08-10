import { useStore } from "@/utils/store";
import { DeleteModal } from "../../modalTemplates";
import { deleteNote } from "@/utils/firestore"

export default function DeleteNoteModal({ setIsDeleteModal, id }) {

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

  return (
    <DeleteModal
      title={"Delete Note?"}
      setIsModelOpen={setIsDeleteModal}
      onClickYes={onClickYes}
    />
  )
}

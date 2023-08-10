
import { useStore } from "@/utils/store";
import { DeleteModal } from "@/components/modals/modalTemplates";
import { removeBookFromShelf } from "@/utils/firestore"

export default function RemoveBookFromShelfModal({ setIsRemoveBookFromShelfModal, bookId }) {

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

  return (
    <DeleteModal
      title={"Remove Book From Shelf?"}
      setIsModelOpen={setIsRemoveBookFromShelfModal}
      onClickYes={onClickYes}
    />
  )
}

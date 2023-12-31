
import { useStore } from "@/utils/store";
import { DeleteModal } from "@/components/modals/modalTemplates";
import { deleteShelf } from "@/utils/firestore"
import { useRouter } from "next/router";

export default function DeleteShelfModal({ setIsDeleteModal }) {

  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)

  const router = useRouter()

  const onClickYes = async () => {
    // delete from firebase
    await deleteShelf(selectedShelfInfo.id)
    // close modal
    setIsDeleteModal(false)
    router.push("/")
  }


  return (
    <DeleteModal
      title={"Delete Shelf?"}
      setIsModelOpen={setIsDeleteModal}
      onClickYes={onClickYes}
    />
  )
}

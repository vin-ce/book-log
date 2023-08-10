import { useStore } from "@/utils/store";
import { DeleteModal } from "@/components/modals/modalTemplates";
import { deleteUserMaterialData } from "@/utils/firestore"
import { useRouter } from "next/router";

export default function DeleteUserMaterialModal({ setIsDeleteModal }) {

  const selectedBookInfo = useStore((state) => state.selectedBookInfo)
  const userBookStatus = useStore((state) => state.userBookStatus)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const router = useRouter()

  const onClickYes = async () => {
    // delete from firebase
    await deleteUserMaterialData({ materialId: selectedBookInfo.id, status: userBookStatus, userId: loggedInUser.id })
    // close modal
    setIsDeleteModal(false)
    router.push("/")
  }

  return (
    <DeleteModal
      title={"Delete Your Book Data?"}
      setIsModelOpen={setIsDeleteModal}
      onClickYes={onClickYes}
    />
  )
}

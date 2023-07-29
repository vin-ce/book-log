import { useStore } from "@/utils/store";
import { StandardModal } from "@/components/modals/modalTemplates";
import styles from "./deleteUserMaterialModal.module.sass"
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

  const onClickCancel = () => setIsDeleteModal(false)

  return (
    <StandardModal
      title={"Delete Your Book Data?"}
      setIsModelOpen={setIsDeleteModal}
    >
      <div className={styles.options}>
        <div className={styles.yes} onClick={onClickYes}>yes</div>
        <div className={styles.cancel} onClick={onClickCancel}>cancel</div>
      </div>
    </StandardModal>
  )
}


import { useStore } from "@/utils/store";
import { StandardModal } from "@/components/modals/modalTemplates";
import styles from "./deleteShelfModal.module.sass"
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

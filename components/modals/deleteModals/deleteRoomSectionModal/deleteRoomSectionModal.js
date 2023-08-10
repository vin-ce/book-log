import { DeleteModal } from "@/components/modals/modalTemplates";
import { deleteSection } from "@/utils/realtime";
import { useStore } from "@/utils/store";

export default function DeleteRoomSectionModal({ sectionId, setIsDeleteModal }) {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)

  const onClickYes = async () => {
    // delete from firebase
    await deleteSection({ roomId: selectedRoomInfo.roomId, sectionId })

    // close modal
    setIsDeleteModal(false)
  }

  return (
    <DeleteModal
      title={"Delete Section?"}
      setIsModelOpen={setIsDeleteModal}
      onClickYes={onClickYes}
    />
  )
}

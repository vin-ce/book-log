import { DeleteModal } from "@/components/modals/modalTemplates";
import { deleteRoomNote } from "@/utils/realtime";
import { useStore } from "@/utils/store";

export default function DeleteRoomNoteModal({ sectionId, noteId, setIsDeleteModal }) {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)

  const onClickYes = async () => {
    // delete from firebase
    await deleteRoomNote({ roomId: selectedRoomInfo.roomId, sectionId, noteId })

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

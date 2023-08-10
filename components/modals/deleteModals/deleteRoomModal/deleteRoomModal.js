import { useStore } from "@/utils/store";
import { DeleteModal } from "@/components/modals/modalTemplates";
import { useRouter } from "next/router";
import { deleteRoom } from "@/utils/realtime";

export default function DeleteRoomModal({ setIsDeleteModal }) {

  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)

  const router = useRouter()

  const onClickYes = async () => {
    // delete from firebase
    await deleteRoom(selectedRoomInfo.roomId)
    // close modal
    setIsDeleteModal(false)
    router.push("/room")
  }

  return (
    <DeleteModal
      title={"Delete Room?"}
      setIsModelOpen={setIsDeleteModal}
      onClickYes={onClickYes}
    />
  )
}

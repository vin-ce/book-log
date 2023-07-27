import { formatDateFromSeconds } from "@/utils/helpers"
import styles from "./shelfInfo.module.sass"
import { useStore } from "@/utils/store"
import { useEffect, useState } from "react"
import { fetchUserById } from "@/utils/firestore"
import Link from "next/link"
import UpdateShelfModal from "@/components/modals/shelfModals/updateShelfModal/updateShelfModal"

export default function ShelfInfo() {

  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)
  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)

  const [selectedCreatorUsername, setSelectedCreatorUsername] = useState(null)

  const isUpdateShelfModal = useStore((state) => state.isUpdateShelfModal)
  const setIsUpdateShelfModal = useStore((state) => state.setIsUpdateShelfModal)


  useEffect(() => {

    if (selectedShelfInfo) init()
    async function init() {
      const user = await fetchUserById(selectedShelfInfo.creatorId)
      setSelectedCreatorUsername(user.username)
    }
  }, [selectedShelfInfo])

  return selectedShelfInfo && (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        <div className={styles.name}>{selectedShelfInfo.name}</div>
        <div>
          by
          <span className={styles.creator}>
            <Link href={`/user/${selectedCreatorUsername}`}>
              {selectedCreatorUsername}
            </Link>
          </span>
        </div>
        {
          selectedShelfInfo.description ?
            <div className={styles.description}>{selectedShelfInfo.description}</div> : null
        }

        <div className={styles.colophon}>
          <div className={styles.count}>{selectedShelfBooksData.length} items</div>
          <div>* {formatDateFromSeconds(selectedShelfInfo.lastUpdatedTimestamp.seconds)}</div>
          <div>+ {formatDateFromSeconds(selectedShelfInfo.createdTimestamp.seconds)}</div>
        </div>

        <div className={styles.shelfSettings} onClick={() => setIsUpdateShelfModal(true)}>+ edit shelf</div>

      </div>

      {isUpdateShelfModal ? <UpdateShelfModal /> : null}

    </div>
  )
}
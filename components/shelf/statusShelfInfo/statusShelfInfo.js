import { useStore } from "@/utils/store"
import styles from "./statusShelfInfo.module.sass"
import Link from "next/link"

export default function StatusShelfInfo() {

  const selectedUserUsername = useStore((state) => state.selectedUserUsername)
  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)
  const selectedStatusForShelf = useStore((state) => state.selectedStatusForShelf)


  let statusText = selectedStatusForShelf
  if (selectedStatusForShelf === "toRead") statusText = "to read"

  return (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        <div>
          <span className={styles.username}>
            <Link href={`/user/${selectedUserUsername}`}>
              @{selectedUserUsername}
            </Link>
          </span>’s
          <span className={styles.name}> {statusText}</span>
        </div>

        <div className={styles.count}>{selectedShelfBooksData.length} items</div>


      </div>
    </div>
  )
}


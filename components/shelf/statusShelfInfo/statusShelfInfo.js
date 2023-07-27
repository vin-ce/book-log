import { useStore } from "@/utils/store"
import styles from "./statusShelfInfo.module.sass"
import Link from "next/link"

export default function StatusShelfInfo({ status }) {

  const selectedUserUsername = useStore((state) => state.selectedUserUsername)
  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)


  let statusText = status
  if (status === "toRead") statusText = "to read"

  return (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        <div>
          <span className={styles.username}>
            <Link href={`/user/${selectedUserUsername}`}>
              {selectedUserUsername}
            </Link>
          </span>'s
          <span className={styles.name}> {statusText}</span>
        </div>

        <div className={styles.count}>{selectedShelfBooksData.length} items</div>


      </div>
    </div>
  )
}
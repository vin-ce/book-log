import { useStore } from "@/utils/store"
import styles from "./profile.module.sass"
import { useEffect, useState } from "react"
import { fetchAllUserShelves, fetchBooksWithStatus, fetchUserById } from "@/utils/firestore"
import { Divider } from "../parts/parts"
import ShelvesIndex from "./shelvesIndex/shelvesIndex"
import CreateMaterialModal from "../modals/materialModals/createMaterialModal/createMaterialModal"
import Link from "next/link"

export default function Profile({ userId }) {

  const [booksWithStatusData, setBooksWithStatusData] = useState(null)

  const selectedUserId = useStore(state => state.selectedUserId)
  const selectedUserUsername = useStore(state => state.selectedUserUsername)
  const isAuthorizedForSelectedUser = useStore(state => state.isAuthorizedForSelectedUser)

  const isCreateMaterialModal = useStore(state => state.isCreateMaterialModal)
  const setIsCreateMaterialModal = useStore(state => state.setIsCreateMaterialModal)


  useEffect(() => {
    if (!booksWithStatusData && selectedUserId) initData()
    async function initData() {
      const data = await fetchBooksWithStatus({ userId: selectedUserId })
      setBooksWithStatusData(data)
    }
  }, [booksWithStatusData, selectedUserId])

  const createStatusEl = (type) => {

    let label = type
    if (label === "toRead") label = "to read"

    const dataLength = booksWithStatusData[type].length

    return (
      <div className={styles.status}>
        <span className={styles.label}>{label}</span>
        {
          dataLength > 0 ?
            <Link href={`/status/${type}/${selectedUserUsername}`}>
              <span className={styles.button}>{booksWithStatusData[type].length}</span>
            </Link>
            :
            <span>{booksWithStatusData[type].length}</span>
        }
      </div >
    )
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.name}>@{selectedUserUsername}</div>
          {
            isAuthorizedForSelectedUser ? <div className={styles.button} onClick={() => setIsCreateMaterialModal(true)}>+ create material</div> : null
          }

        </div>
        {
          booksWithStatusData ?
            <div className={styles.statusContainer}>
              {createStatusEl("toRead")}
              {createStatusEl("reading")}
              {createStatusEl("read")}
            </div>
            : null
        }
        <Divider />
        <ShelvesIndex />
      </div>
      {
        isCreateMaterialModal ? <CreateMaterialModal /> : null
      }
    </>
  )
}

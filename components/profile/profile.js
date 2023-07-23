import { useStore } from "@/utils/store"
import styles from "./profile.module.sass"
import { useEffect, useState } from "react"
import { fetchAllUserShelves, fetchBooksWithStatus } from "@/utils/firestore"
import { Divider } from "../parts/parts"
import ShelvesIndex from "./shelvesIndex/shelvesIndex"

export default function Profile() {
  const loggedInUser = useStore((state) => state.loggedInUser)
  const [booksWithStatusData, setBooksWithStatusData] = useState(null)



  useEffect(() => {
    if (!booksWithStatusData && loggedInUser) initData()
    async function initData() {
      const data = await fetchBooksWithStatus({ userId: loggedInUser.id })
      setBooksWithStatusData(data)
    }
  }, [booksWithStatusData, loggedInUser])

  const createStatusEl = (type) => {

    let label = type
    if (label === "toRead") label = "to read"

    const dataLength = booksWithStatusData[type].length

    return (
      <div className={styles.status}>
        <span className={styles.label}>{label}</span>
        {
          dataLength > 0 ?
            <span className={styles.button}>{booksWithStatusData[type].length}</span>
            :
            <span>{booksWithStatusData[type].length}</span>
        }
      </div >
    )

  }


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.name}>@{loggedInUser.username}</div>
        <div className={styles.button}>+ add link</div>

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
  )
}

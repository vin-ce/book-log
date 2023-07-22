import { updateUserBookStatus } from "@/utils/firestore";
import { useStore } from "@/utils/store";
import { useEffect, useState } from "react";
import styles from "./userBookStatus.module.sass"
import ReadDate from "./readDate/readDate";

export default function UserBookStatus() {

  const [statusEl, setStatusEl] = useState(null)

  const userBookStatus = useStore((state) => state.userBookStatus)
  const setUserBookStatus = useStore((state) => state.setUserBookStatus)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)

  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)


  useEffect(() => {
    const onSelectStatus = (e) => {
      const selectedStatus = e.target.id.replace(/^status-/, "");
      updateUserBookStatus({ bookId: selectedBookId, userId: selectedBookUserId, status: selectedStatus })
      setUserBookStatus(selectedStatus)
    }

    if (userBookStatus) {
      if (isAuthorizedForUserBook) {

        switch (userBookStatus) {
          case "toRead": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span><span className={styles.selectedStatus}>to read</span></span>
                  <span id="status-reading" className={styles.button} onClick={onSelectStatus}>reading</span>
                  <span id="status-read" className={styles.button} onClick={onSelectStatus}>read</span>
                </div>
              </div>
            )
            break
          }
          case "reading": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span id="status-toRead" className={styles.button} onClick={onSelectStatus}>
                    to read
                  </span>
                  <span>
                    <span className={styles.selectedStatus}>reading</span>
                  </span>
                  <span id="status-read" className={styles.button} onClick={onSelectStatus}>
                    read
                  </span>
                </div>
              </div>
            )
            break
          }
          case "read": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span id="status-toRead" className={styles.button} onClick={onSelectStatus}>to read</span>
                  <span id="status-reading" className={styles.button} onClick={onSelectStatus}>reading</span>
                  <span><span className={styles.selectedStatus}>read</span></span>
                </div>
              </div>
            )
            break
          }
          default: {
            console.log("something went wrong in user book info status buttons")
            break
          }
        }


      } else {
        switch (userBookStatus) {
          case "toRead": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span><span className={styles.selectedStatus}>to read</span></span>
                </div>
              </div>
            )
            break
          }
          case "reading": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span>
                    <span className={styles.selectedStatus}>reading</span>
                  </span>
                </div>
              </div>
            )
            break
          }
          case "read": {
            setStatusEl(
              <div className={styles.statusContainer}>
                <div className={styles.label}>status:</div>
                <div className={styles.bookStatus}>
                  <span><span className={styles.selectedStatus}>read</span></span>
                </div>
              </div>
            )
            break
          }
          default: {
            console.log("something went wrong in user book info status buttons")
            break
          }
        }
      }

    } else {

      if (isAuthorizedForUserBook) {
        setStatusEl(
          <div className={styles.statusContainer}>
            <div className={styles.label}>status:</div>
            <div className={styles.bookStatus}>
              <span id="status-toRead" className={styles.button} onClick={onSelectStatus}>to read</span>
              <span id="status-reading" className={styles.button} onClick={onSelectStatus}>reading</span>
              <span id="status-read" className={styles.button} onClick={onSelectStatus}>read</span>
            </div>
          </div>
        )

      } else {
        // setStatusEl(<div>no stat</div>)
        setStatusEl(null)
      }

    }

    // primary dependencies are userBookStatus & isAuthorizedForUserBook
    // other ones shouldn't change without a page reload
  }, [userBookStatus, isAuthorizedForUserBook, selectedBookId, selectedBookUserId, setUserBookStatus])



  return (
    <div>
      {statusEl}
      {
        userBookStatus === "read" ? <ReadDate /> : null
      }
    </div>
  )

}


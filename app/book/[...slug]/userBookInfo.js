import { useEffect, useState } from "react"
import { useStore } from "../../utils/store"
import styles from "./userBookInfo.module.sass"
import { fetchUserBookInfo } from "@/app/utils/firestore"



function createStatusEl({ status, isAuthorized }) {
  let statusEl

  const onSelectStatus = (e) => {
    const selectedStatus = e.target.id
    console.log("selected status", selectedStatus)
  }

  if (status) {
    if (isAuthorized) {

      switch (status) {
        case "toRead": {
          statusEl = (
            <div className={styles.bookStatus}>status:
              <span>&#91;<span className={styles.selectedStatus}>to read</span>&#93;</span>
              <span id="status-reading" className={styles.button} onClick={onSelectStatus}>&#91;reading&#93;</span>
              <span id="status-read" className={styles.button} onClick={onSelectStatus}>&#91;read&#93;</span>
            </div>
          )
          break
        }
        case "reading": {
          statusEl = (
            <div className={styles.bookStatus}>status:
              <span id="status-toRead" className={styles.button} onClick={onSelectStatus}>
                &#91;to read&#93;
              </span>
              <span>
                &#91;<span className={styles.selectedStatus}>reading</span>&#93;
              </span>
              <span id="status-read" className={styles.button} onClick={onSelectStatus}>
                &#91;read&#93;
              </span>
            </div>
          )
          break
        }
        case "read": {
          statusEl = (
            <div className={styles.bookStatus}>status:
              <span id="status-toRead" className={styles.button} onClick={onSelectStatus}>&#91;to read&#93;</span>
              <span id="status-reading" className={styles.button} onClick={onSelectStatus}>&#91;reading&#93;</span>
              <span>&#91;<span className={styles.selectedStatus}>read</span>&#93;</span>
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
      statusEl = (
        <div className={styles.bookStatus}>status:
          <div className={styles.bookStatus}>status:
            <span id="status-to-read" className={styles.button} onClick={onSelectStatus}>&#91;to read&#93;</span>
            <span id="status-reading" className={styles.button} onClick={onSelectStatus}>&#91;reading&#93;</span>
            <span id="status-read" className={styles.button} onClick={onSelectStatus}>&#91;read&#93;</span>
          </div>
        </div>
      )
    }

  } else {
    if (isAuthorized) {
      statusEl = (
        <div className={styles.bookStatus}>status:
          <span className={styles.button} onClick={onSelectStatus}>&#91;to read&#93;</span>
          <span className={styles.button} onClick={onSelectStatus}>&#91;reading&#93;</span>
          <span className={styles.button} onClick={onSelectStatus}>&#91;read&#93;</span>
        </div>
      )

    } else {
      statusEl = null
    }

  }

  return statusEl
}


async function createUserBookInfo({ userId, username, isAuthorized, bookId, setEl }) {
  // highlight + remove brackets & button

  const userBookData = await fetchUserBookInfo({ bookId, userId })
  console.log("user book data", userBookData)

  let statusEl = createStatusEl({ status: userBookData.status, isAuthorized })

  setEl(
    <div className={styles.contentContainer}>
      <div className={styles.name}>&#91;@{username}&#93;</div>
      {statusEl}
      <div>notes</div>
      <div>grid of saved things</div>
    </div>
  )
}

export default function UserBookInfo({ username, bookId }) {

  const [el, setEl] = useState(<div>no user selected</div>)
  const loggedInUser = useStore((state) => state.loggedInUser)

  // check if loggedInUser matches slug username -
  // do additional check on backend if it matches

  // fetch status of book for user
  // fetch 

  useEffect(() => {
    // if logged in user is the same page user
    if (username && loggedInUser) {
      setEl(
        <div>loading...</div>
      )

      createUserBookInfo({ userId: loggedInUser.id, isAuthorized: loggedInUser.username === username, username, bookId, setEl })
      // if (loggedInUser.username === username) {


      // } else {

      //   setEl(
      //     <div className={styles.contentContainer}>
      //       <div className={styles.name}>&#91;@{username}&#93;</div>
      //       <div className={styles.bookStatus}>status:
      //         <span>to read</span>
      //         <span>reading</span>
      //         <span>read</span>
      //       </div>
      //       <div>in these collections</div>
      //       <div>grid of saved things</div>

      //     </div>
      //   )
      // }

    } else {
      setEl(
        <div>no user selected</div>
      )
    }

  }, [loggedInUser, username, bookId])


  return (
    <div className={styles.panelContainer}>
      {el}
    </div>
  )
}
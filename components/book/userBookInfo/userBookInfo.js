import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import styles from "./userBookInfo.module.sass"
import { fetchUserBookInfo, fetchUserByUsername } from "@/utils/firestore"
import UserBookStatus from "./userBookStatus"
import UserBookShelves from "./userBookShelves"

export default function UserBookInfo() {

  const [contentEl, setContentEl] = useState(<>No user selected.</>)
  const [ready, setReady] = useState(false)

  const [isAuthorized, setIsAuthorized] = useState(false)

  const loggedInUser = useStore((state) => state.loggedInUser)

  const selectedBookUserUsername = useStore((state) => state.selectedBookUserUsername)

  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const setSelectedBookUserId = useStore((state) => state.setSelectedBookUserId)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)

  const setUserBookStatus = useStore((state) => state.setUserBookStatus)

  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  // const userBookNotes = useStore((state) => state.userBookNotes)
  // const setUserBookNotes = useStore((state) => state.setUserBookNotes)


  // sets data
  useEffect(() => {

    if (!ready) initEl()

    async function initEl() {
      if (selectedBookUserUsername && !selectedBookUserId) {

        // the user that we're viewing, not necessarily the logged in user
        const userData = await fetchUserByUsername(selectedBookUserUsername)
        if (userData) {

          setSelectedBookUserId(userData.id)

          const userBookData = await fetchUserBookInfo({ bookId: selectedBookId, userId: userData.id })

          if (userBookData) {
            console.log("setting")
            setUserBookStatus(userBookData.status)
            setUserBookShelfIdList(userBookData.shelves)
            // setUserBookNotes(userBookData.notes)
          }

          setReady(true)
        }
      }

    }

  }, [ready, selectedBookId, selectedBookUserId, selectedBookUserUsername, setSelectedBookUserId, setUserBookShelfIdList, setUserBookStatus])


  // sets is authorized
  useEffect(() => {
    if (loggedInUser && selectedBookUserId) if (loggedInUser.id === selectedBookUserId) setIsAuthorized(true)
  }, [loggedInUser, selectedBookUserId])


  // sets content after data is ready
  // updates if authorization changes
  useEffect(() => {
    if (ready) {
      setContentEl(
        <>
          <div className={styles.name}>@{selectedBookUserUsername}</div>
          <div className={styles.statusShelvesContainer}>
            <UserBookStatus isAuthorized={isAuthorized} />
            <UserBookShelves isAuthorized={isAuthorized} />
          </div>
          {/* {notesEl} */}
        </>
      )
    }
  }, [ready, isAuthorized, selectedBookUserUsername])



  return (
    <div className={styles.panelContainer}>
      <div className={styles.contentContainer}>
        {contentEl}
      </div>
    </div>
  )
}




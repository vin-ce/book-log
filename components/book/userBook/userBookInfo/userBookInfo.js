import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import styles from "./userBookInfo.module.sass"
import { fetchUserBookInfo, fetchUserByUsername } from "@/utils/firestore"
import UserBookStatus from "../userBookStatus/userBookStatus"
import UserBookShelves from "../userBookShelves/userBookShelves"
import UserBookNotes from "../userBookNotes/userBookNotes"
import UserBookRating from "../userBookRating/userBookRating"
import { useFreshRef } from "@/hooks/useFreshRef"

export default function UserBookInfo() {

  const [contentEl, setContentEl] = useState(<>No user selected.</>)

  const [ready, setReady] = useFreshRef(false)

  const loggedInUser = useStore((state) => state.loggedInUser)

  const selectedBookUserUsername = useStore((state) => state.selectedBookUserUsername)

  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const setSelectedBookUserId = useStore((state) => state.setSelectedBookUserId)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)

  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookRating = useStore((state) => state.setUserBookRating)

  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  const setIsAuthorizedForUserBook = useStore((state) => state.setIsAuthorizedForUserBook)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)


  // sets data
  useEffect(() => {

    if (!ready.current) initEl()

    async function initEl() {

      if (selectedBookUserUsername && !selectedBookUserId) {
        // the user that we're viewing, not necessarily the logged in user
        const userData = await fetchUserByUsername(selectedBookUserUsername)
        if (userData) {

          setSelectedBookUserId(userData.id)

          const userBookData = await fetchUserBookInfo({ bookId: selectedBookId, userId: userData.id })

          if (userBookData) {
            setUserBookStatus(userBookData.status)
            setUserBookShelfIdList(userBookData.shelves)
            setUserBookRating(userBookData.rating)
            setUserBookNotes(userBookData.notes)
          }

          setReady(true)
        }
      } else if (!selectedBookUserUsername || selectedBookUserId) {
        setReady(true)
      }
    }

  }, [ready, selectedBookId, selectedBookUserId, selectedBookUserUsername, setReady, setSelectedBookUserId, setUserBookNotes, setUserBookRating, setUserBookShelfIdList, setUserBookStatus])


  // sets is authorized
  useEffect(() => {
    if (loggedInUser && selectedBookUserId)
      if (loggedInUser.id === selectedBookUserId)
        setIsAuthorizedForUserBook(true)

  }, [loggedInUser, selectedBookUserId, setIsAuthorizedForUserBook])


  // sets content after data is ready.current
  // updates if authorization changes
  useEffect(() => {
    if (ready.current) {
      setContentEl(
        <>
          <div className={styles.name}>@{selectedBookUserUsername}</div>
          <div className={styles.statusShelvesContainer}>
            <UserBookStatus />
            <UserBookShelves />
            <UserBookRating />
          </div>
          <UserBookNotes />
        </>
      )
    }
    // selectedBookUserId as dependency because ready does not register change
  }, [ready, selectedBookUserUsername])



  return (
    <div className={styles.panelContainer}>
      {
        ready.current ?
          (
            <div className={styles.contentContainer}>
              <div className={styles.name}>@{selectedBookUserUsername}</div>
              <div className={styles.statusShelvesContainer}>
                <UserBookStatus />
                <UserBookShelves />
                <UserBookRating />
              </div>
              <UserBookNotes />
            </div>
          )
          :
          null
      }
    </div>
  )
}




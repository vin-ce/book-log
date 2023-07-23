import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import styles from "./userBookInfo.module.sass"
import { fetchUserBookInfo, fetchUserByUsername } from "@/utils/firestore"
import UserBookStatus from "../userBookStatus/userBookStatus"
import UserBookShelves from "../userBookShelves/userBookShelves"
import UserBookNotes from "../userBookNotes/userBookNotes"
import UserBookRating from "../userBookRating/userBookRating"
import { useFreshRef } from "@/hooks/useFreshRef"
import { Divider } from "@/components/parts/parts"

export default function UserBookInfo() {

  const [ready, setReady] = useFreshRef(false)

  const loggedInUser = useStore((state) => state.loggedInUser)

  const selectedBookUserUsername = useStore((state) => state.selectedBookUserUsername)

  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const setSelectedBookUserId = useStore((state) => state.setSelectedBookUserId)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)

  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setUserBookRating = useStore((state) => state.setUserBookRating)

  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)
  const setIsAuthorizedForUserBook = useStore((state) => state.setIsAuthorizedForUserBook)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)


  // sets data
  useEffect(() => {

    initEl()

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
            setUserBookReadDate(userBookData.readDate)
            setUserBookRating(userBookData.rating)
            setUserBookNotes(userBookData.notes)
          }

          setReady(true)
        }
      } else if (!ready.current && (!selectedBookUserUsername || selectedBookUserId)) {
        setReady(true)
      }
    }

  }, [ready, selectedBookId, selectedBookUserId, selectedBookUserUsername, setReady, setSelectedBookUserId, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus])


  // sets is authorized
  useEffect(() => {

    if (loggedInUser && selectedBookUserId && !isAuthorizedForUserBook)
      if (loggedInUser.id === selectedBookUserId)
        setIsAuthorizedForUserBook(true)

  }, [isAuthorizedForUserBook, loggedInUser, selectedBookUserId, setIsAuthorizedForUserBook])




  return (
    <div className={styles.panelContainer}>
      {
        ready.current ?
          (
            <>
              <div className={styles.contentContainer}>
                <div className={styles.name}>@{selectedBookUserUsername}</div>
                <div className={styles.statusShelvesContainer}>
                  <UserBookStatus />
                  <UserBookShelves />
                  <UserBookRating />
                </div>
                <Divider />
                <UserBookNotes />
              </div>
            </>
          )
          :
          <div className={styles.contentContainer}>No user selected or found</div>
      }
    </div>
  )
}




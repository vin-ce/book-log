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
import { ResetStates } from "@/utils/helpers"
import Link from "next/link"

export default function UserBookInfo() {

  const [ready, setReady] = useFreshRef(false)

  const loggedInUser = useStore((state) => state.loggedInUser)

  const selectedUserUsername = useStore((state) => state.selectedUserUsername)

  const selectedUserId = useStore((state) => state.selectedUserId)
  const setSelectedUserId = useStore((state) => state.setSelectedUserId)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)

  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setUserBookRating = useStore((state) => state.setUserBookRating)

  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)
  const setIsAuthorizedForSelectedUser = useStore((state) => state.setIsAuthorizedForSelectedUser)

  const userBookNotes = useStore((state) => state.userBookNotes)
  const setUserBookNotes = useStore((state) => state.setUserBookNotes)

  const [isNoUserData, setIsNoUserData] = useState(false)

  // sets data
  useEffect(() => {

    initEl()

    async function initEl() {

      if (selectedUserUsername && !selectedUserId) {
        // the user that we're viewing, not necessarily the logged in user
        const userData = await fetchUserByUsername(selectedUserUsername)
        if (userData) {

          setSelectedUserId(userData.id)

          const userBookData = await fetchUserBookInfo({ bookId: selectedBookId, userId: userData.id })

          if (userBookData) {
            setUserBookStatus(userBookData.status)
            setUserBookShelfIdList(userBookData.shelves)
            setUserBookReadDate(userBookData.readDate)
            setUserBookRating(userBookData.rating)
            setUserBookNotes(userBookData.notes)
          } else {
            setIsNoUserData(true)
          }

          setReady(true)
        }
      } else if (!ready.current && (!selectedUserUsername || selectedUserId)) {
        setReady(true)
      }
    }

  }, [ready, selectedBookId, selectedUserId, selectedUserUsername, setReady, setSelectedUserId, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus])


  return (
    <>
      <div className={styles.panelContainer}>
        {
          ready.current && !isNoUserData ?
            (
              <>
                <div className={styles.contentContainer}>
                  <Link href={`/user/${selectedUserUsername}`}>
                    <div className={styles.name}>@{selectedUserUsername}</div>
                  </Link>
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
            <div className={styles.contentContainer}>~+#+~</div>
        }

      </div>
      <ResetStates />
    </>
  )
}




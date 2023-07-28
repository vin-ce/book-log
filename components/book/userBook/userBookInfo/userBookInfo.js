import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import styles from "./userBookInfo.module.sass"
import { checkHasBookData, fetchBookById, fetchUserBookInfo, fetchUserByUsername, updateUserBookStatus } from "@/utils/firestore"
import UserBookStatus from "../userBookStatus/userBookStatus"
import UserBookShelves from "../userBookShelves/userBookShelves"
import UserBookNotes from "../userBookNotes/userBookNotes"
import UserBookRating from "../userBookRating/userBookRating"
import { useFreshRef } from "@/hooks/useFreshRef"
import { Divider } from "@/components/parts/parts"
import { ResetStates } from "@/utils/helpers"
import Link from "next/link"
import { useRouter } from "next/router"

export default function UserBookInfo() {

  const [ready, setReady] = useFreshRef(false)

  const selectedUserUsername = useStore((state) => state.selectedUserUsername)

  const selectedUserId = useStore((state) => state.selectedUserId)
  const setSelectedUserId = useStore((state) => state.setSelectedUserId)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const selectedBookInfo = useStore((state) => state.selectedBookInfo)

  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setUserBookRating = useStore((state) => state.setUserBookRating)

  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  const setUserBookNotes = useStore((state) => state.setUserBookNotes)
  const selectedBookExists = useStore((state) => state.selectedBookExists)

  const [isUserData, setIsUserData] = useState(false)

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

          console.log("user book data", userBookData)

          if (userBookData) {
            setUserBookStatus(userBookData.status)
            setUserBookShelfIdList(userBookData.shelves)
            setUserBookReadDate(userBookData.readDate)
            setUserBookRating(userBookData.rating)
            setUserBookNotes(userBookData.notes)

            setIsUserData(true)
          }

          setReady(true)
        }
      } else if (!ready.current && (!selectedUserUsername || selectedUserId)) {
        setReady(true)
      }
    }

  }, [ready, selectedBookId, selectedUserId, selectedUserUsername, setReady, setSelectedUserId, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus])

  const router = useRouter()

  const handleAddBookToProfile = async () => {
    // checks if book is in database
    checkHasBookData({ bookId: selectedBookId, bookData: selectedBookInfo })

    // set status
    await updateUserBookStatus({ bookId: selectedBookId, userId: selectedUserId, status: "toRead" })

    router.reload()
  }

  return (
    <>
      <div className={styles.panelContainer}>
        {
          ready.current ?
            isUserData ?
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
              // no user data but user is authorized and the book exists
              !isUserData && isAuthorizedForSelectedUser && selectedBookExists ?
                <div className={styles.contentContainer}>
                  <Link href={`/user/${selectedUserUsername}`}>
                    <div className={styles.name}>@{selectedUserUsername}</div>
                  </Link>
                  <div className={styles.button} onClick={handleAddBookToProfile}>+ add book to your profile</div>
                </div>
                :
                // book does not exist and / or user is not authorized
                <div className={styles.contentContainer}>~+#+~</div>
            : null
        }

      </div>
      <ResetStates />
    </>
  )
}




import UserBookInfo from "@/components/book/userBook/userBookInfo/userBookInfo"
import BookView from "@/components/book/bookView/bookView"
import Split from 'react-split'
import styles from "./book.module.sass"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"

import AddBookToShelfModal from "@/components/modals/addBookToShelfModal/addBookToShelfModal"

// router solution:
// https://github.com/vercel/next.js/discussions/11484#:~:text=Jun%202%2C%202022-,Here%27s,-my%20workaround.%20In

export default function Book() {

  const setSelectedBookUserUsername = useStore((state) => state.setSelectedBookUserUsername)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const setSelectedBookUserId = useStore((state) => state.setSelectedBookUserId)
  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setUserBookRating = useStore((state) => state.setUserBookRating)
  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)
  const setIsAuthorizedForUserBook = useStore(state => state.setIsAuthorizedForUserBook)
  const setUserBookNotes = useStore(state => state.setUserBookNotes)

  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady && !ready) {
      let bookId = router.query.slug[0]
      let username = router.query.slug[1]

      // if book page has no username and user is logged in
      // redirect to user's book page
      if (!username && loggedInUser) router.push(`/book/${bookId}/${loggedInUser.username}`)

      setSelectedBookId(bookId)
      setSelectedBookUserUsername(username)

      // reset
      setSelectedBookUserId(null)
      setUserBookStatus(null)
      setUserBookReadDate(null)
      setUserBookRating(null)
      setUserBookShelfIdList(null)
      setIsAuthorizedForUserBook(false)
      setUserBookNotes(null)

      setReady(true)
    }
  }, [loggedInUser, ready, router, setIsAuthorizedForUserBook, setSelectedBookId, setSelectedBookUserId, setSelectedBookUserUsername, setUserBookNotes, setUserBookRating, setUserBookShelfIdList, setUserBookStatus])

  return ready && (
    <main>
      <Split
        sizes={[5, 95]}
        minSize={[464, 480]}
        // maxSize={[480, Infinity]}
        expandToMin={true}
        gutterSize={4}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className={styles.splitContainer}
      >
        <BookView />
        <UserBookInfo />
      </Split>
    </main>
  )
}


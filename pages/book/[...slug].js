import UserBookInfo from "@/components/book/userBook/userBookInfo/userBookInfo"
import BookView from "@/components/book/bookView/bookView"
import Split from 'react-split'
import styles from "./book.module.sass"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"

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
  }, [loggedInUser, ready, router, setIsAuthorizedForUserBook, setSelectedBookId, setSelectedBookUserId, setSelectedBookUserUsername, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus])

  useEffect(() => {

    if (router.isReady) {
      let bookId = router.query.slug[0]
      let username = router.query.slug[1]

      // if book page has no username and user is logged in
      // redirect to user's book page
      if (!username && loggedInUser) {
        router.replace(`/book/${bookId}/${loggedInUser.username}`)
        // this is set here because above userEffect is not going to run again
        // and it's required for userBookInfo to refresh 
        setSelectedBookUserUsername(loggedInUser.username)
      }
    }

  }, [loggedInUser, router])

  return ready && (
    <main>
      <Split
        sizes={[5, 95]}
        minSize={[464, 480]}
        expandToMin={true}
        gutterSize={2}
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


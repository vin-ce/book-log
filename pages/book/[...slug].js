import UserBookInfo from "@/components/book/userBookInfo/userBookInfo"
import BookView from "@/components/book/bookView"
import Split from 'react-split'
import styles from "./book.module.sass"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"

import AddBookToShelfModal from "@/components/modals/addBookToShelfModal"

// router solution:
// https://github.com/vercel/next.js/discussions/11484#:~:text=Jun%202%2C%202022-,Here%27s,-my%20workaround.%20In

export default function Book() {

  const setSelectedBookUserUsername = useStore((state) => state.setSelectedBookUserUsername)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)
  const isAddBookToShelfModal = useStore((state) => state.isAddBookToShelfModal)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      let bookId = router.query.slug[0]
      let username = router.query.slug[1]

      // if book page has no username and user is logged in
      // redirect to user's book page
      if (!username && loggedInUser) router.push(`/book/${bookId}/${loggedInUser.username}`)

      setSelectedBookId(bookId)
      setSelectedBookUserUsername(username)
      setReady(true)
    }
  }, [loggedInUser, router, setSelectedBookId, setSelectedBookUserUsername])

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
      {isAddBookToShelfModal ?
        (<AddBookToShelfModal />) :
        null
      }
    </main>
  )
}

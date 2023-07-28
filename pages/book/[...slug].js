import UserBookInfo from "@/components/book/userBook/userBookInfo/userBookInfo"
import BookInfo from "@/components/book/bookInfo/bookInfo"
import Split from 'react-split'
import styles from "./book.module.sass"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import { ResetStates } from "@/utils/helpers"

// router solution:
// https://github.com/vercel/next.js/discussions/11484#:~:text=Jun%202%2C%202022-,Here%27s,-my%20workaround.%20In

export default function Book() {

  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const isMaterial = useStore((state) => state.isMaterial)

  const [ready, setReady] = useState(false)
  const router = useRouter()

  // reads router / slug info and sets state
  useEffect(() => {
    if (router.isReady && !ready) {
      let bookId = router.query.slug[0]
      let username = router.query.slug[1]

      setSelectedBookId(bookId)
      setSelectedUserUsername(username)

      setReady(true)
    }
  }, [ready, router.isReady, router.query.slug, setSelectedBookId, setSelectedUserUsername])

  // if book page has no username and user is logged in
  // redirect to user's book page
  useEffect(() => {

    if (router.isReady) {
      let bookId = router.query.slug[0]
      let username = router.query.slug[1]

      if (!username && loggedInUser) {
        if (isMaterial) router.replace(`/material/${bookId}/${loggedInUser.username}`)
        else router.replace(`/book/${bookId}/${loggedInUser.username}`)
        // this is set here because above userEffect is not going to run again
        // and it's required for userBookInfo to refresh 
        setSelectedUserUsername(loggedInUser.username)
      }
    }

  }, [isMaterial, loggedInUser, router, setSelectedUserUsername])

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
        <BookInfo isMaterial={isMaterial} />
        <UserBookInfo isMaterial={isMaterial} />
      </Split>
      {
        !isMaterial ? <ResetStates /> : null
      }
    </main>
  )
}


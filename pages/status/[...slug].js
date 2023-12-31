import { ResetStates, sortBooksByRating } from "@/utils/helpers"
import styles from "./statusShelf.module.sass"
import ShelfInfo from "@/components/shelf/shelfInfo/shelfInfo"
import ShelfBooks from "@/components/shelf/shelfBooks/shelfBooks"
import Split from "react-split"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import { fetchBooksOfStatus, fetchUserByUsername } from "@/utils/firestore"
import StatusShelfInfo from "@/components/shelf/statusShelfInfo/statusShelfInfo"
import Head from "next/head"

export default function Shelf() {


  const [ready, setReady] = useState(false)
  const router = useRouter()

  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const setSelectedShelfBooksData = useStore((state) => state.setSelectedShelfBooksData)

  const selectedStatusForShelf = useStore((state) => state.selectedStatusForShelf)
  const setSelectedStatusForShelf = useStore((state) => state.setSelectedStatusForShelf)

  const setSelectedUserId = useStore((state) => state.setSelectedUserId)
  const selectedUserUsername = useStore((state) => state.selectedUserUsername)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)

  const [hasData, setHasData] = useState(true)

  // reads router / slug info and sets state
  useEffect(() => {

    if (router.isReady && !ready) init()
    async function init() {
      let status = router.query.slug[0]
      let username = router.query.slug[1]

      if (username) setSelectedUserUsername(username)
      else {
        setHasData(false)
        return
      }


      const user = await fetchUserByUsername(username)
      if (user) setSelectedUserId(user.id)
      else {
        setHasData(false)
        return
      }

      let shelfBooksData
      switch (status) {

        case "toRead": {
          shelfBooksData = await fetchBooksOfStatus({ userId: user.id, status: "toRead" })
          break
        }

        case "reading": {
          shelfBooksData = await fetchBooksOfStatus({ userId: user.id, status: "reading" })
          break
        }

        case "read": {
          shelfBooksData = await fetchBooksOfStatus({ userId: user.id, status: "read" })
          break
        }

        default: {
          setHasData(false)
          return
        }

      }

      setSelectedStatusForShelf(status)

      if (!shelfBooksData || shelfBooksData.length === 0) return

      // sort by rating
      shelfBooksData = sortBooksByRating([...shelfBooksData])

      setSelectedShelfBooksData(shelfBooksData)

      setReady(true)

    }
  }, [ready, router.isReady, router.query.slug, setSelectedShelfBooksData, setSelectedShelfInfo, setSelectedStatusForShelf, setSelectedUserId, setSelectedUserUsername])


  return (
    <>
      <Head>
        {
          selectedUserUsername ?
            <title>
              @{selectedUserUsername}’s {statusToText(selectedStatusForShelf)} — messy table
            </title>
            : null
        }
      </Head>
      {
        ready ?
          hasData ?
            <Split
              sizes={[5, 95]}
              minSize={[320, 480]}
              expandToMin={true}
              gutterSize={2}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              className={styles.splitContainer}
            >
              <StatusShelfInfo />
              <ShelfBooks />
            </Split>
            :
            <div className={styles.container}>no shelf found</div>
          :
          <div className={styles.container}>loading...</div>
      }

      <ResetStates type={"full"} />
    </>
  )
}

function statusToText(status) {
  switch (status) {
    case "toRead":
      return "to read"
    case "reading":
      return "reading"
    case "read":
      return "read"
  }
}
import { ResetStates, sortBooksByRating } from "@/utils/helpers"
import styles from "./shelf.module.sass"
import ShelfInfo from "@/components/shelf/shelfInfo/shelfInfo"
import ShelfBooks from "@/components/shelf/shelfBooks/shelfBooks"
import Split from "react-split"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import { fetchShelf, fetchBooksInShelf, fetchUserById } from "@/utils/firestore"
import Head from "next/head"

export default function Shelf() {


  const [ready, setReady] = useState(false)
  const router = useRouter()

  const selectedShelfInfo = useStore((state) => state.selectedShelfInfo)
  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const setSelectedShelfBooksData = useStore((state) => state.setSelectedShelfBooksData)

  const setSelectedUserId = useStore((state) => state.setSelectedUserId)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)

  // reads router / slug info and sets state
  useEffect(() => {

    if (router.isReady && !ready) init()

    async function init() {
      let shelfId = router.query.slug

      const shelfInfo = await fetchShelf(shelfId)
      if (!shelfInfo) return

      setSelectedShelfInfo(shelfInfo)

      setSelectedUserId(shelfInfo.creatorId)
      const selectedUserData = await fetchUserById(shelfInfo.creatorId)
      setSelectedUserUsername(selectedUserData.username)

      let shelfBooksData = await fetchBooksInShelf({ shelfId, userId: shelfInfo.creatorId })

      // sort by rating
      shelfBooksData = sortBooksByRating([...shelfBooksData])

      setSelectedShelfBooksData(shelfBooksData)

      setReady(true)

    }

  }, [ready, router.isReady, router.query.slug, setSelectedShelfBooksData, setSelectedShelfInfo, setSelectedUserId])


  return (
    <>
      <Head>
        <title>
          {selectedShelfInfo ? `${selectedShelfInfo.name} — messy table` : null}
        </title>
      </Head>
      {
        ready ?
          selectedShelfInfo ?
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
              <ShelfInfo />
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

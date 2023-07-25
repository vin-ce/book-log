import { ResetStates } from "@/utils/helpers"
import styles from "./shelf.module.sass"
import ShelfInfo from "@/components/shelf/shelfInfo/shelfInfo"
import ShelfBooks from "@/components/shelf/shelfBooks/shelfBooks"
import Split from "react-split"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useStore } from "@/utils/store"
import { fetchShelf, fetchBooksForShelf } from "@/utils/firestore"

export default function Shelf() {


  const [ready, setReady] = useState(false)
  const router = useRouter()

  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const setSelectedShelfBooksData = useStore((state) => state.setSelectedShelfBooksData)

  const setSelectedUserId = useStore((state) => state.setSelectedUserId)

  // reads router / slug info and sets state
  useEffect(() => {

    if (router.isReady && !ready) init()
    async function init() {
      let shelfId = router.query.slug

      const shelfInfo = await fetchShelf(shelfId)
      if (!shelfInfo) return

      setSelectedShelfInfo(shelfInfo)

      setSelectedUserId(shelfInfo.creatorId)

      const shelfBooksData = await fetchBooksForShelf({ shelfId, userId: shelfInfo.creatorId })

      setSelectedShelfBooksData(shelfBooksData)

      setReady(true)

    }
  }, [ready, router.isReady, router.query.slug, setSelectedShelfBooksData, setSelectedShelfInfo, setSelectedUserId])


  return (
    <>
      {
        ready ?
          <Split
            sizes={[5, 95]}
            minSize={[400, 480]}
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
      }

      <ResetStates />
    </>
  )
}

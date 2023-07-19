
import { useEffect, useState } from "react"
import styles from "./userBookShelves.module.sass"
import { useStore } from "@/utils/store"
import { fetchShelvesFromIdList } from "@/utils/firestore"
import Link from "next/link"

export default function UserBookShelves({ isAuthorized }) {

  const [shelfEl, setShelfEl] = useState(null)
  const userBookShelfIdList = useStore((state) => state.userBookShelfIdList)

  const setIsAddBookToShelfModal = useStore((state) => state.setIsAddBookToShelfModal)

  useEffect(() => {

    initEl()

    async function initEl() {

      // shelf list / data
      let shelfListEl
      if (userBookShelfIdList) {

        let shelfItemsArr = []
        const shelvesDataArr = await fetchShelvesFromIdList(userBookShelfIdList)
        console.log("shelf data", shelvesDataArr)

        if (shelvesDataArr.length > 0) {
          const NUM_OF_SHELVES = shelvesDataArr.length

          for (let i = 0; i < NUM_OF_SHELVES; i++) {
            shelfItemsArr.push(
              <span key={shelvesDataArr[i].id} className={styles.item}>
                <Link href={`/shelf/${shelvesDataArr[i].id}`}>
                  {shelvesDataArr[i].name}
                </Link>
              </span>
            )

            if (NUM_OF_SHELVES > 1 && i !== NUM_OF_SHELVES - 1) {
              shelfItemsArr.push(
                <span key={`${shelvesDataArr[i].id}_comma`} className={styles.comma}>,</span>
              )
            }
          }

          shelfListEl = (
            <div className={styles.list}>
              {shelfItemsArr}
            </div>
          )
        }

      }

      // shelf button
      let addShelfButtonEl
      if (isAuthorized) addShelfButtonEl = <div className={styles.addShelfButton} onClick={() => setIsAddBookToShelfModal(true)}>+ add</div>

      setShelfEl(
        <div className={styles.container}>
          <div className={styles.label}>shelves:</div>
          <div className={styles.shelfContainer}>
            {shelfListEl}
            {addShelfButtonEl}
          </div>
        </div>
      )
    }


  }, [isAuthorized, userBookShelfIdList])


  return (
    <>
      {shelfEl}
    </>
  )
}
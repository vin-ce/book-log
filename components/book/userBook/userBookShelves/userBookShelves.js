
import { useEffect, useState } from "react"
import styles from "./userBookShelves.module.sass"
import { useStore } from "@/utils/store"
import { fetchShelvesFromIdList } from "@/utils/firestore"
import Link from "next/link"
import AddBookToShelfModal from "@/components/modals/addBookToShelfModal/addBookToShelfModal"

export default function UserBookShelves() {

  const [shelfListEl, setShelfListEl] = useState(null)
  const userBookShelfIdList = useStore((state) => state.userBookShelfIdList)

  const isAddBookToShelfModal = useStore((state) => state.isAddBookToShelfModal)
  const setIsAddBookToShelfModal = useStore((state) => state.setIsAddBookToShelfModal)

  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)


  useEffect(() => {
    if (userBookShelfIdList) createShelfListEl()

    async function createShelfListEl() {

      // shelf list / data

      let shelfItemsArr = []
      const shelvesDataArr = await fetchShelvesFromIdList(userBookShelfIdList)

      if (shelvesDataArr.length > 0) {
        const NUM_OF_SHELVES = shelvesDataArr.length

        for (let i = 0; i < NUM_OF_SHELVES; i++) {
          let comma
          if (NUM_OF_SHELVES > 1 && i !== NUM_OF_SHELVES - 1) {
            comma = (
              <span key={`${shelvesDataArr[i].id}_comma`} className={styles.comma}>,</span>
            )
          }

          shelfItemsArr.push(
            <span key={shelvesDataArr[i].id}>
              <span className={styles.item}>
                <Link href={`/shelf/${shelvesDataArr[i].id}`}>
                  {shelvesDataArr[i].name}
                </Link>
              </span>
              {comma}
            </span>
          )

        }

        setShelfListEl(
          <div className={styles.list}>
            {shelfItemsArr}
          </div>
        )
      }


    }
  }, [userBookShelfIdList])

  return (
    <>
      {
        userBookShelfIdList ?
          (
            <div className={styles.container}>
              <div className={styles.label}>shelves:</div>
              <div className={styles.shelfContainer}>

                {shelfListEl}

                {isAuthorizedForUserBook ?
                  (<div className={styles.addShelfButton} onClick={() => setIsAddBookToShelfModal(true)}>+ add</div>) : null
                }
              </div>
            </div>
          )
          :
          null
      }

      {isAddBookToShelfModal ? <AddBookToShelfModal /> : null}
    </>
  )
}
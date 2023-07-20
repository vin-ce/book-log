import { useStore } from "@/utils/store"
import styles from "./userBookRating.module.sass"
import { useEffect, useState } from "react"
import SetBookRatingModal from "@/components/modals/setBookRatingModal/setBookRatingModal"

export default function UserBookRating() {
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)
  const userBookRating = useStore((state) => state.userBookRating)

  const isSetBookRatingModal = useStore((state) => state.isSetBookRatingModal)
  const setIsSetBookRatingModal = useStore((state) => state.setIsSetBookRatingModal)

  const [ratingEl, setRatingEl] = useState(null)


  useEffect(() => {
    const onClickAddRating = (e) => setIsSetBookRatingModal(true)


    // userBookRating = 0 -> this counts as false
    if (userBookRating) {

      if (isAuthorizedForUserBook) {

        setRatingEl(
          <div className={styles.container}>
            <div className={styles.label}>rating:</div>
            <div className={styles.button} onClick={onClickAddRating}>{userBookRating}</div>
          </div>
        )
      } else {

        setRatingEl(
          <div className={styles.container}>
            <div className={styles.label}>rating:</div>
            <div>{userBookRating}</div>
          </div>
        )

      }


    } else {
      if (isAuthorizedForUserBook) {
        setRatingEl(
          <div className={styles.container}>
            <div className={styles.label}>rating:</div>
            <div className={styles.button} onClick={onClickAddRating}>+add rating</div>
          </div>
        )
      } else {

      }

    }

    // primary dependencies are userBookStatus & isAuthorizedForUserBook
    // other ones shouldn't change without a page reload
  }, [isAuthorizedForUserBook, userBookRating])


  return (
    <>
      {ratingEl}
      {isSetBookRatingModal ? <SetBookRatingModal /> : null}
    </>
  )
}


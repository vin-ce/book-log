import { useStore } from "@/utils/store"
import styles from "./setBookRatingModal.module.sass"
import { useEffect, useState } from "react"
import { updateUserBookRating } from "@/utils/firestore"

export default function SetBookRatingModal() {

  const userBookRating = useStore((state) => state.userBookRating)
  const setUserBookRating = useStore((state) => state.setUserBookRating)
  const setIsSetBookRatingModal = useStore((state) => state.setIsSetBookRatingModal)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const [ratingEl, setRatingEl] = useState(null)

  const closeModal = (e) => setIsSetBookRatingModal(false)

  const handleWrapperClick = (e) => closeModal()

  const handleModalClick = (e) => e.stopPropagation()

  const onClickRating = (e) => {
    const rating = e.target.id
    setUserBookRating(rating)
    updateUserBookRating({ bookId: selectedBookId, userId: selectedBookUserId, rating })
  }


  useEffect(() => {
    const ratingNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    let ratingElArr = []

    ratingNum.forEach(num => {
      let el
      console.log("num", num, userBookRating)
      if (num.toString() === userBookRating) {
        el = <div className={styles.selected}>{num}</div>

      } else {
        el = <div id={num} onClick={onClickRating} className={styles.unselected}>{num}</div>
      }
      ratingElArr.push(el)
    })

    setRatingEl(ratingElArr)

  }, [userBookRating])


  return (
    <div className={styles.wrapper} onClick={handleWrapperClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <span className={styles.title}>Set Book Rating</span>
          <span className={styles.button} onClick={closeModal}>x</span>
        </div>
        <div className={styles.ratingContainer}>
          {ratingEl}
        </div>
      </div>
    </div>
  )

}
import { useStore } from "@/utils/store"
import styles from "./setBookRatingModal.module.sass"
import { useEffect, useState } from "react"
import { updateUserBookRating } from "@/utils/firestore"
import { StandardModal } from "../modalTemplates"

export default function SetBookRatingModal() {

  const userBookRating = useStore((state) => state.userBookRating)
  const setUserBookRating = useStore((state) => state.setUserBookRating)
  const setIsSetBookRatingModal = useStore((state) => state.setIsSetBookRatingModal)
  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const [ratingEl, setRatingEl] = useState(null)


  useEffect(() => {
    const onClickRating = (e) => {
      const rating = e.target.id
      setUserBookRating(rating)
      updateUserBookRating({ bookId: selectedBookId, userId: selectedUserId, rating })
    }

    const ratingNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    let ratingElArr = []

    ratingNum.forEach(num => {
      let el
      if (num.toString() === userBookRating) {
        el = <div className={styles.selected}>{num}</div>

      } else {
        el = <div id={num} onClick={onClickRating} className={styles.unselected}>{num}</div>
      }
      ratingElArr.push(el)
    })

    setRatingEl(
      <div className={styles.ratingContainer}>
        {ratingElArr}
      </div>
    )

  }, [selectedBookId, selectedUserId, setUserBookRating, userBookRating])

  return (
    <StandardModal
      title={"Set Book Rating"}
      setIsModelOpen={setIsSetBookRatingModal}
    >
      {ratingEl}
    </StandardModal>
  )

}
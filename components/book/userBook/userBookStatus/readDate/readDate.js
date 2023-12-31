import SetBookReadDateModal from "@/components/modals/setBookReadDateModal/setBookReadDateModal"
import { useStore } from "@/utils/store"
import { useEffect, useState } from "react"
import styles from "./readDate.module.sass"
import { formatDateFromSlash } from "@/utils/helpers"

export default function ReadDate() {
  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  const userBookReadDate = useStore((state) => state.userBookReadDate)

  const isSetBookReadDateModal = useStore((state) => state.isSetBookReadDateModal)
  const setIsSetBookReadDateModal = useStore((state) => state.setIsSetBookReadDateModal)

  const [readDateEl, setReadDateEl] = useState(null)


  useEffect(() => {
    const onClickAddReadDate = (e) => setIsSetBookReadDateModal(true)


    // userBookRating = 0 -> this counts as false
    if (userBookReadDate) {

      const formattedReadDate = formatDateFromSlash(userBookReadDate)

      if (isAuthorizedForSelectedUser) {

        setReadDateEl(
          <div className={styles.container}>
            <div className={styles.label}>read date:</div>
            <div className={styles.button} onClick={onClickAddReadDate}>{formattedReadDate}</div>
          </div>
        )
      } else {

        setReadDateEl(
          <div className={styles.container}>
            <div className={styles.label}>read date:</div>
            <div>{formattedReadDate}</div>
          </div>
        )

      }


    } else {
      if (isAuthorizedForSelectedUser) {
        setReadDateEl(
          <div className={styles.container}>
            <div className={styles.label}>read:</div>
            <div className={styles.button} onClick={onClickAddReadDate}>+ date</div>
          </div>
        )
      } else {

      }

    }

    // primary dependencies are userBookStatus & isAuthorizedForSelectedUser
    // other ones shouldn't change without a page reload
  }, [isAuthorizedForSelectedUser, userBookReadDate, setIsSetBookReadDateModal])


  return (
    <>
      {readDateEl}
      {isSetBookReadDateModal ? <SetBookReadDateModal /> : null}
    </>
  )
}

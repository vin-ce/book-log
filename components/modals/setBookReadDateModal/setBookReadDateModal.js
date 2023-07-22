import styles from "./setBookReadDateModal.module.sass"
import { useStore } from "@/utils/store"
import { useEffect, useState } from "react"
import { updateUserBookRating, updateUserBookReadDate } from "@/utils/firestore"
import { StandardModal } from "../modalTemplates"
import { extractPartsFromDashDate } from "@/utils/helpers"

export default function SetBookReadDateModal() {

  const userBookReadDate = useStore((state) => state.userBookReadDate)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setIsSetBookReadDateModal = useStore((state) => state.setIsSetBookReadDateModal)

  const selectedBookId = useStore((state) => state.selectedBookId)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)

  const [dayInput, setDayInput] = useState('')
  const [monthInput, setMonthInput] = useState('')
  const [yearInput, setYearInput] = useState('')

  const [dayPlaceholder, setDayPlaceholder] = useState('dd')
  const [monthPlaceholder, setMonthPlaceholder] = useState('mm')
  const [yearPlaceholder, setYearPlaceholder] = useState('yyyy')

  const handleDayChange = (e) => {
    let input = e.target.value
    if (!checkIsNumberOrBlank(input)) return
    if (input.length > 2) return

    setDayInput(input)
  }
  const handleMonthChange = (e) => {
    let input = e.target.value
    if (!checkIsNumberOrBlank(input)) return
    if (input.length > 2) return

    setMonthInput(input)
  }
  const handleYearChange = (e) => {
    let input = e.target.value
    if (!checkIsNumberOrBlank(input)) return
    if (input.length > 4) return

    setYearInput(input)
  }

  useEffect(() => {
    if (userBookReadDate) {
      const dateParts = extractPartsFromDashDate(userBookReadDate)
      setDayInput(dateParts.day)
      setMonthInput(dateParts.month)
      setYearInput(dateParts.year)
    }
  }, [userBookReadDate])


  const handleSetReadDate = async () => {
    const isDateInputValid = validateDate(dayInput, monthInput, yearInput)
    if (!isDateInputValid) {
      // reset input
      setDayInput('')
      setMonthInput('')
      setYearInput('')
      // show warning in placeholders
      setDayPlaceholder('date')
      setMonthPlaceholder('is')
      setYearPlaceholder('invalid')
    } else {
      const readDate = `${dayInput}/${monthInput}/${yearInput}`
      // set app state
      setUserBookReadDate(readDate)
      // update in firebase
      await updateUserBookReadDate({ bookId: selectedBookId, userId: selectedBookUserId, readDate })
      // close modal
      setIsSetBookReadDateModal(false)
    }
  }


  return (
    <StandardModal
      title={"Set Read Date"}
      setIsModelOpen={setIsSetBookReadDateModal}
      modalClass={styles.modal}
    >
      <div>
        <div className={styles.inputContainer}>
          <input type="text" placeholder={dayPlaceholder} onChange={handleDayChange} value={dayInput} className={styles.day} />
          <input type="text" placeholder={monthPlaceholder} onChange={handleMonthChange} value={monthInput} className={styles.month} />
          <input type="text" placeholder={yearPlaceholder} onChange={handleYearChange} value={yearInput} className={styles.year} />
        </div>
        <div className={styles.setButton} onClick={handleSetReadDate} >+ set</div>
      </div>
    </StandardModal>
  )

}

const checkIsNumberOrBlank = (input) => {
  const numberOrBlankRegex = /^(\d+)?$/;
  return numberOrBlankRegex.test(input)
}

const isValidDay = (day) => {
  // Check if the day is a valid number and falls within 1 to 31 range
  return /^\d{1,2}$/.test(day) && parseInt(day, 10) >= 1 && parseInt(day, 10) <= 31;
};

const isValidMonth = (month) => {
  // Check if the month is a valid number and falls within 1 to 12 range
  return /^\d{1,2}$/.test(month) && parseInt(month, 10) >= 1 && parseInt(month, 10) <= 12;
};

const isValidYear = (year) => {
  // Check if the year is a valid number and falls within a reasonable range
  return /^\d{4}$/.test(year) && parseInt(year, 10) >= 1900 && parseInt(year, 10) <= 2100;
};

const validateDate = (day, month, year) => {
  if (!isValidDay(day)) {
    return false;
  }

  if (!isValidMonth(month)) {
    return false;
  }

  if (!isValidYear(year)) {
    return false;
  }

  // All checks passed, date is valid
  return true;
};
import { useStore } from "@/utils/store"
import styles from "./shelfBooks.module.sass"
import { useEffect, useState } from "react"
import Book from "@/pages/book/[...slug]"
import { fetchBooksFromIdList } from "@/utils/firestore"
import Image from "next/image"

export default function ShelfBooks() {
  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)

  return (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        {
          selectedShelfBooksData.length !== 0 ?
            <>
              <div className={styles.header}>
                <div className={styles.sortContainer}>
                  <span className={styles.label}>sort:</span>
                  <span className={styles.button}>rating desc</span>
                </div>
                <div className={styles.button}>+ edit shelf</div>
              </div>

              <BookList />
            </>
            :
            <div className={styles.error}>~+#+~</div>
        }
      </div>
    </div>
  )
}

function BookRow({ bookData }) {

  let imageEl
  if (bookData.imageUrl) imageEl = (
    <div className={styles.imageContainer}>
      <Image src={bookData.imageUrl} alt={"Book cover."} width={160} height={160} priority={true} />
    </div>
  )

  let bookAuthorEl
  if (bookData.authors) bookAuthorEl = <div className={styles.author}>by {bookData.authors.join(', ')}</div>

  return (
    <div key={`book-row_${bookData.id}`} className={styles.bookRowContainer}>
      {imageEl}
      <div className={styles.titleAuthorContainer}>
        <div className={styles.title}>{bookData.title}</div>
        {bookAuthorEl}
      </div>
      <div className={styles.rating}>
        {
          bookData.rating ? bookData.rating / 10 : <span className={styles.unrated}>unrated</span>
        }
      </div>
      <div className={styles.note}>+ pin up to 2 notes</div>
      <div className={styles.note}>note 2</div>
    </div>
  )

}

function BookList() {

  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (selectedShelfBooksData.length !== 0) {
      console.log('data', selectedShelfBooksData)
      let rowsArr = []
      selectedShelfBooksData.forEach(bookData => {
        rowsArr.push(<BookRow bookData={bookData} />)
      })
      setRows(rowsArr)
    }
  }, [selectedShelfBooksData])


  return (
    <div className={styles.bookList}>
      {rows}
    </div>
  )

}
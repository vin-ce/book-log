import { searchBookById } from "@/app/utils/bookAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
import styles from "./bookView.module.sass"

export default function BookView({ bookId }) {

  const [el, setEl] = useState(null)

  useEffect(() => {

    async function fetchData() {
      const bookData = await searchBookById(bookId)
      console.log("book data: ", bookData)

      let bookAuthorString
      if (bookData.authors) bookAuthorString = bookData.authors.join(', ')

      // let subtitleEl
      // if (bookData.subtitle) subtitleEl = <div className={styles.subtitle}>{bookData.subtitle}</div>

      setEl(
        <div className={styles.bookContainer}>
          <div className={styles.imageContainer}>
            <Image src={bookData.imageUrl} alt={"Book cover."} width={480} height={480} />
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.title}>{bookData.title}</div>
            <div className={styles.subtitle}>{bookData.subtitle}</div>
            <div className={styles.author}>by {bookAuthorString}</div>
            <div className={styles.description} dangerouslySetInnerHTML={{ __html: bookData.description }}></div>
            <div className={styles.pageCount}>{bookData.pageCount} pages</div>
            <div className={styles.publishedDate}>{formatDate(bookData.publishedDate)}</div>
          </div>
        </div>
      )
    }
    fetchData()

  }, [bookId])

  console.log("book data")

  return (
    <div className={styles.panelContainer}>
      {el}
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString);

  const options = { month: "long", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return formattedDate
}
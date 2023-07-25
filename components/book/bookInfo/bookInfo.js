import { searchBookById } from "@/utils/bookAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
import styles from "./bookInfo.module.sass"
import { useStore } from "@/utils/store"
import { checkHasBookData, fetchMaterialById } from "@/utils/firestore"

export default function BookInfo({ isMaterial }) {

  const [el, setEl] = useState(null)
  const selectedBookId = useStore((state) => state.selectedBookId)

  useEffect(() => {

    if (selectedBookId) fetchData()

    async function fetchData() {
      let bookData
      if (isMaterial) bookData = await fetchMaterialById(selectedBookId)
      else bookData = await searchBookById(selectedBookId)

      if (!bookData) {
        setEl(<div className={styles.errorContainer}>Cannot find book!</div>)
      } else {
        checkHasBookData({ bookId: selectedBookId, bookData })
        setEl(createBookEl(bookData))
      }
    }

  }, [isMaterial, selectedBookId])


  return (
    <div className={styles.panelContainer}>
      {el}
    </div>
  )
}

function createBookEl(bookData) {

  let imageEl
  if (bookData.imageUrl) imageEl = (
    <div className={styles.imageContainer}>
      <Image src={bookData.imageUrl} alt={"Book cover."} width={480} height={480} priority={true} />
    </div>
  )

  let linkEl
  if (bookData.link) linkEl = (
    <div className={styles.link}><a href={bookData.link} target={'_blank'}>{`link ->`}</a></div>
  )

  let bookAuthorEl
  if (bookData.authors) bookAuthorEl = <div className={styles.author}>by {bookData.authors.join(', ')}</div>

  let subtitleEl
  if (bookData.subtitle) subtitleEl = <div className={styles.subtitle}>{bookData.subtitle}</div>

  let pageCountEl
  if (bookData.pageCount) pageCountEl = <div className={styles.pageCount}>{bookData.pageCount} pages</div>

  let publishedDateEl
  if (bookData.publishedDate) publishedDateEl = <div className={styles.publishedDate}>{formatDate(bookData.publishedDate)}</div>

  let publisherEl
  if (bookData.publisher) publisherEl = <div className={styles.publisher}>{bookData.publisher}</div>

  return (
    <div className={styles.bookContainer}>
      {imageEl}
      <div className={styles.infoContainer}>
        <div className={styles.title}>{bookData.title}</div>
        {subtitleEl}
        {bookAuthorEl}
        {linkEl}
        <div className={styles.description} dangerouslySetInnerHTML={{ __html: bookData.description }}></div>
        {pageCountEl}
        {publishedDateEl}
        {publisherEl}
      </div>
    </div>
  )
}

function formatDate(dateString) {
  const date = new Date(dateString);

  const options = { month: "long", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  return formattedDate
}
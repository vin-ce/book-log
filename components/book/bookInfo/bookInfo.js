import { searchBookById } from "@/utils/bookAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
import styles from "./bookInfo.module.sass"
import { useStore } from "@/utils/store"
import { checkHasBookData, fetchMaterialById } from "@/utils/firestore"
import { formatDateFromSlash } from "@/utils/helpers"

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
        setEl(createBookEl(bookData, isMaterial))
      }
    }

  }, [isMaterial, selectedBookId])


  return (
    <div className={styles.panelContainer}>
      {el}
    </div>
  )
}

function createBookEl(bookData, isMaterial) {

  let imageEl
  if (bookData.imageUrl) {
    if (!isMaterial) {
      imageEl = (
        <div className={styles.imageContainer}>
          <Image src={bookData.imageUrl} alt={"Book cover."} width={480} height={480} priority={true} />
        </div>
      )
    } else {
      imageEl = (
        <div className={styles.imageContainer}>
          <img src={bookData.imageUrl} alt={"Book cover."} width={480} height={480} />
        </div>
      )
    }
  }


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
  if (bookData.publishedDate) publishedDateEl = <div className={styles.publishedDate}>{formatDateFromSlash(bookData.publishedDate)}</div>

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
        {bookData.description ?
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: bookData.description }}></div>
          : null
        }
        <div className={styles.extraInfo}>
          {pageCountEl}
          {publishedDateEl}
          {publisherEl}
        </div>
      </div>
    </div>
  )
}

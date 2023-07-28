import { searchBookById } from "@/utils/bookAPI"
import Image from "next/image"
import { useEffect, useState } from "react"
import styles from "./bookInfo.module.sass"
import { useStore } from "@/utils/store"
import { fetchMaterialById, fetchUserById } from "@/utils/firestore"
import { formatDateFromSeconds, formatDateFromSlash } from "@/utils/helpers"
import MaterialInfoModal from "@/components/modals/materialModals/materialInfoModal"
import Link from "next/link"

export default function BookInfo() {

  const [el, setEl] = useState(null)
  const selectedBookId = useStore((state) => state.selectedBookId)
  const setSelectedBookInfo = useStore((state) => state.setSelectedBookInfo)
  const setSelectedBookExists = useStore((state) => state.setSelectedBookExists)
  const isMaterial = useStore((state) => state.isMaterial)

  useEffect(() => {

    if (selectedBookId) fetchData()

    async function fetchData() {

      let bookData
      let materialCreator
      if (isMaterial) bookData = await fetchMaterialById(selectedBookId)
      else bookData = await searchBookById(selectedBookId)

      if (!bookData) {
        setEl(<div className={styles.errorContainer}>Cannot find book!</div>)
        setSelectedBookExists(false)

      } else {
        setSelectedBookExists(true)

        setSelectedBookInfo(bookData)
        if (isMaterial) {
          materialCreator = await fetchUserById(bookData.creatorId)


          setEl(
            <BookEl
              bookData={bookData}
              isMaterial={isMaterial}
              materialCreatorUsername={materialCreator.username}
            />
          )

        }
        else setEl(<BookEl bookData={bookData} isMaterial={isMaterial} />)

      }
    }

  }, [isMaterial, selectedBookId, setSelectedBookExists, setSelectedBookInfo])


  return (
    <div className={styles.panelContainer}>
      {el}
    </div>
  )
}

function BookEl({ bookData, isMaterial, materialCreatorUsername }) {
  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)
  const isMaterialInfoModal = useStore((state) => state.isMaterialInfoModal)
  const setIsMaterialInfoModal = useStore((state) => state.setIsMaterialInfoModal)


  let imageEl
  if (bookData.imageUrl) {
    if (!isMaterial) {
      imageEl = (
        <div className={styles.imageContainer}>
          <Image src={bookData.imageUrl} alt={"Book cover."} width={400} height={480} priority={true} />
        </div>
      )
    } else {
      imageEl = (
        <div className={styles.imageContainer}>
          <img src={bookData.imageUrl} alt={"Book cover."} width={400} height={480} />
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
    <>
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
            {
              isMaterial ?
                <div className={styles.attribution}>
                  <div>+ by <Link href={`/user/${materialCreatorUsername}`} className={styles.button}>@{materialCreatorUsername}</Link></div>
                  <div>on {formatDateFromSeconds(bookData.createdTimestamp.seconds)}</div>
                </div>
                : null
            }
          </div>
        </div>
        {
          isMaterial && isAuthorizedForSelectedUser ?
            <div className={styles.editMaterialButton} onClick={() => setIsMaterialInfoModal(true)}>+ edit material</div>
            : null
        }
      </div >
      {
        isMaterialInfoModal ? <MaterialInfoModal type={"update"} /> : null
      }
    </>
  )
}


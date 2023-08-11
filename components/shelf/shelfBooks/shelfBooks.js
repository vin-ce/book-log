import { useStore } from "@/utils/store"
import styles from "./shelfBooks.module.sass"
import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import PinNoteToBookInShelfModal from "@/components/modals/pinNoteToBookInShelfModal/pinNoteToBookInShelfModal"
import TweetEmbed from "react-tweet-embed"
import { useFreshRef } from "@/hooks/useFreshRef"
import RemoveBookFromShelfModal from "@/components/modals/deleteModals/removeBookFromShelfModal/removeBookFromShelfModal"

export default function ShelfBooks() {
  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)

  return (
    <div className={styles.panelContainer}>
      <div className={styles.container}>
        {
          selectedShelfBooksData.length !== 0 ?
            <BookList />
            :
            <div className={styles.error}>~+#+~</div>
        }
      </div>
    </div>
  )
}


function BookList() {

  const selectedShelfBooksData = useStore((state) => state.selectedShelfBooksData)
  const [rows, setRows] = useState(null)

  useEffect(() => {
    if (selectedShelfBooksData.length !== 0) {

      let rowsArr = []
      selectedShelfBooksData.forEach(bookData => {
        rowsArr.push(
          <React.Fragment key={`book-row_${bookData.id}`}>
            <BookRow bookData={bookData} />
          </React.Fragment>
        )
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


function BookRow({ bookData }) {

  const [isPinNoteToBookInShelfModal, setIsPinNoteToBookInShelfModal] = useState(false)
  const [pinnedNoteEl, setPinnedNoteEl] = useState(null)
  const [pinnedNoteData, setPinnedNoteData] = useState(null)

  const [isRemoveBookFromShelfModal, setIsRemoveBookFromShelfModal] = useState(false)

  const selectedStatusForShelf = useStore((state) => state.selectedStatusForShelf)
  const selectedUserUsername = useStore((state) => state.selectedUserUsername)
  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  let bookLink = `/book/${bookData.id}/${selectedUserUsername}`
  if (bookData.type === "material") bookLink = `/material/${bookData.id}/${selectedUserUsername}`


  // init set pinned note data into state
  useEffect(() => {
    if (bookData.pinnedNote) { setPinnedNoteData(bookData.pinnedNote) }
  }, [bookData])

  // sets pinned note el
  useEffect(() => {
    if (pinnedNoteData) {
      setPinnedNoteEl(
        <div className={styles.noteContainer}>
          <Note data={pinnedNoteData} pinnedNoteRef={pinnedNoteRef} />
        </div>
      )
    } else if (bookData.notes) {
      // empty container to still hold the space
      setPinnedNoteEl(
        <div className={styles.noteContainer}>
        </div>
      )
    }
  }, [bookData.notes, isAuthorizedForSelectedUser, pinnedNoteData])


  // EXPAND / COLLAPSE ROW

  const bookRowContainerRef = useRef(null)
  const pinnedNoteRef = useRef(null)
  const [isRowExpanded, setIsRowExpanded] = useFreshRef(false)
  const toggleExpandRow = (isExpandRow) => {

    // if it isn't expand row or the row is currently already expanded
    if (!isExpandRow || isRowExpanded.current) {
      bookRowContainerRef.current.style.height = "160px"
      setIsRowExpanded(false)
    } else {
      bookRowContainerRef.current.style.height = `${pinnedNoteRef.current.offsetHeight}px`
      setIsRowExpanded(true)
    }
  }

  const [isExpandContractRow, setIsExpandContractRow] = useState(false)

  useEffect(() => {

    if (pinnedNoteEl && pinnedNoteRef.current)
      if (pinnedNoteRef.current.offsetHeight > 160) setIsExpandContractRow(true)
      else setIsExpandContractRow(false)

  }, [pinnedNoteEl])




  const handleOpenNotesModal = () => {
    setIsPinNoteToBookInShelfModal(true)
    toggleExpandRow(false)
  }

  const handleRemoveBookFromShelf = () => setIsRemoveBookFromShelfModal(true)

  return (
    <>
      <div className={styles.bookRowContainer} ref={bookRowContainerRef}>
        {
          bookData.imageUrl ?
            <div className={styles.imageContainer}>
              {
                bookData.type === "material"
                  ?
                  <img src={bookData.imageUrl} alt={"Book cover."} width={160} height={160} />
                  :
                  <Image src={bookData.imageUrl} alt={"Book cover."} width={160} height={160} priority={true} />
              }
            </div>
            :
            <div className={styles.imageContainer} />
        }

        <div className={styles.titleAuthorContainer}>
          <div className={styles.title}>
            <Link href={bookLink}>{bookData.title}</Link>
          </div>

          {
            bookData.authors ?
              <div className={styles.author}>
                by {bookData.authors.join(', ')}
              </div>
              : null
          }
        </div>

        <div className={styles.rating}>
          {
            bookData.rating ?
              `${bookData.rating}/10` :
              <span className={styles.unrated}>~#~</span>
          }
        </div>

        {pinnedNoteEl}

        <div className={styles.rightColButtonsContainer}>
          {
            isExpandContractRow ?
              <div className={styles.button} onClick={toggleExpandRow}>
                {isRowExpanded.current ? `↑` : `↓`}
              </div>
              : null
          }
          {
            isAuthorizedForSelectedUser ?
              <div className={styles.bottomButtonsContainer}>
                {
                  selectedStatusForShelf ? null :
                    <>
                      {
                        bookData.notes ?
                          <div className={styles.button} onClick={handleOpenNotesModal}>!</div>
                          : null
                      }
                      <div className={styles.button} onClick={handleRemoveBookFromShelf}>x</div>
                    </>
                }
              </div>
              : null
          }
        </div>


        {/* MODALS */}

        {
          isRemoveBookFromShelfModal ?
            <RemoveBookFromShelfModal
              bookId={bookData.id}
              setIsRemoveBookFromShelfModal={setIsRemoveBookFromShelfModal}
            />
            : null
        }

        {
          isPinNoteToBookInShelfModal ?
            <PinNoteToBookInShelfModal
              setIsPinNoteToBookInShelfModal={setIsPinNoteToBookInShelfModal}
              pinnedNoteData={pinnedNoteData}
              setPinnedNoteData={setPinnedNoteData}
              bookData={bookData}
            />
            : null
        }
      </div>
    </>
  )

}


function Note({ data, pinnedNoteRef }) {

  if (data.type === "tweet") {
    return (
      <div className={[styles.note, styles.tweet].join(' ')} ref={pinnedNoteRef}>
        <TweetEmbed tweetId={data.tweetId} options={{ conversation: "none", dnt: "true" }} />
      </div>
    )

  } else if (data.type === "text") {
    return (
      <div className={styles.note} ref={pinnedNoteRef}>
        {data.content}
      </div>
    )

  } else {
    return (<div>something went wrong</div>)
  }

}

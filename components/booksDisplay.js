import { useEffect, useState } from "react"

import Image from "next/image"
import styles from "./booksDisplay.module.sass"
import Link from "next/link"
import { useStore } from "../utils/store"

// receives array of book data, parses it to layout
export default function BooksDisplay({ data, type }) {

  const [resultsEl, setResultsEl] = useState(null)
  const loggedInUser = useStore((state) => state.loggedInUser)


  useEffect(() => {
    if (data) {
      if (loggedInUser) setResultsEl(makeGridEl(data, loggedInUser.username))
      else setResultsEl(makeGridEl(data))
    } else {
      setResultsEl(<div className={styles.error}>~+#+~</div>)
    }
  }, [data, loggedInUser])

  return (
    <div>
      {/* <div>settings bar - filter, view</div> */}
      {resultsEl}
    </div>
  )
}


function makeGridEl(data, username) {

  const elArr = []

  data.forEach(book => {
    let bookAuthorString
    if (book.authors) bookAuthorString = book.authors.join(', ')

    let bookUrl = `/book/${book.id}`
    if (username) bookUrl += `/${username}`

    elArr.push(
      <Link href={bookUrl} key={book.id}>
        <div className={styles.bookItem}>
          <div className={styles.title}>{book.title}</div>
          <Image src={book.imageUrl} alt={"Book cover."} width={160} height={160} />
          <div className={styles.author}>{bookAuthorString}</div>
          {/* <div className={styles.description}>{book.description}</div> */}
        </div>
      </Link>
    )
  })

  return (
    <div className={styles.booksGrid}>
      {elArr}
    </div>
  )
}

function makeListEl(data) {

}
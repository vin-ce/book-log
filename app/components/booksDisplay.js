import { useEffect, useState } from "react"

import Image from "next/image"
import styles from "./booksDisplay.module.sass"
import Link from "next/link"
import { useStore } from "../utils/store"

// receives array of book data, parses and 
export default function BooksDisplay({ data, type }) {

  const [booksDataArr, setBooksDataArr] = useState(null)
  const [resultsEl, setResultsEl] = useState(null)
  const loggedInUser = useStore((state) => state.loggedInUser)

  useEffect(() => {
    if (data) {
      setBooksDataArr(data)
      if (loggedInUser) setResultsEl(makeGridEl(data, loggedInUser.username))
      else setResultsEl(makeGridEl(data))
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
    console.log("book authors: ", book.authors)
    let bookAuthorString
    if (book.authors) bookAuthorString = book.authors.join(', ')

    let bookUrl = `/book/${book.id}`
    if (username) bookUrl += `/${username}`
    console.log("username: ", username)

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
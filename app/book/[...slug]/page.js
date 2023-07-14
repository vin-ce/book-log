'use client'

import UserBookInfo from "./userBookInfo"
import BookView from "./bookView"
import Split from 'react-split'
import styles from "./bookPage.module.sass"

export default function Book({ params }) {

  console.log("params: ", params)
  const bookId = params.slug[0]
  const username = params.slug[1]


  return (
    <main>
      <Split
        sizes={[5, 95]}
        minSize={[464, 480]}
        // maxSize={[480, Infinity]}
        expandToMin={true}
        gutterSize={4}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className={styles.splitContainer}
      >
        <BookView bookId={bookId} />
        <UserBookInfo username={username} bookId={bookId} />
      </Split>
    </main>
  )
}


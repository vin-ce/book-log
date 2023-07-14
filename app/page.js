'use client'

import styles from './page.module.sass'
import Search from './search/search'
import Dashboard from './dashboard/dashboard'
import Split from 'react-split'

export default function Home() {

  // const bookData = await searchBook()

  return (
    // <main className={styles.main}>
    <main >
      <Split
        sizes={[50, 50]}
        minSize={480}
        expandToMin={true}
        gutterSize={4}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className={styles.splitContainer}
      >
        <Search />
        <Dashboard />
      </Split>
    </main>
  )
}


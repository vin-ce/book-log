import styles from './index.module.sass'
import Search from '../components/search/search'
import Dashboard from '../components/dashboard/dashboard'
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


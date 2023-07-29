import styles from './index.module.sass'
import Books from '../components/books/books'
import Dashboard from '../components/dashboard/dashboard'
import Split from 'react-split'
import Head from 'next/head'

export default function Home() {

  return (
    <>
      <Head>
        <title>home</title>
      </Head>
      <main >
        <Split
          sizes={[50, 50]}
          minSize={[464, 480]}
          expandToMin={true}
          gutterSize={4}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className={styles.splitContainer}
        >
          <Books />
          <Dashboard />
        </Split>
      </main>
    </>
  )
}


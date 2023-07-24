import Link from "next/link"
import styles from "./404.module.sass"

export default function Custom404() {
  return <div className={styles.container}>woops page not found! <Link href="/" className={styles.button}>go home</Link></div>
}
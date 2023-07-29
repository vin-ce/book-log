import Link from "next/link"

import styles from "./nav.module.sass"
import { LogInOutButtons } from "../logInOutButtons/logInOutButtons"



export default function Nav() {

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.button}>home</Link>
      <LogInOutButtons />
    </div>
  )
}
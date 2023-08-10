
import styles from "./nav.module.sass"
import { LogInOutButtons } from "../logInOutButtons/logInOutButtons"
import { useRouter } from "next/router"



export default function Nav() {

  const router = useRouter()
  const onClickHome = () => {
    if (router.pathname !== "/rooms" && router.pathname !== "/rooms/[id]") {
      router.push('/')
    } else {
      router.push('/rooms')
    }
  }

  return (
    <div className={styles.container}>
      <span onClick={onClickHome} className={styles.button}>home</span>
      <LogInOutButtons pathname={router.pathname} />
    </div>
  )
}
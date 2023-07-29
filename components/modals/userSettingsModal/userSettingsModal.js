import { useStore } from "@/utils/store"
import { StandardModal } from "../modalTemplates"
import styles from "./userSettingsModal.module.sass"
import { useEffect, useRef, useState } from "react"
import { fetchUserByUsername, updateUserUsername } from "@/utils/firestore"
import { useRouter } from "next/router"

export default function UserSettingsModal() {

  const setIsUserSettingsModal = useStore((state) => state.setIsUserSettingsModal)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)
  const setLoggedInUser = useStore((state) => state.setLoggedInUser)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const router = useRouter()

  const [usernameInput, setUsernameInput] = useState(loggedInUser.username)
  const usernameInputRef = useRef(null)
  const handleUsernameChange = e => {
    e.preventDefault()

    if (e.target.value.length > 20) return

    let username = sanitizeString(e.target.value)
    setUsernameInput(username)
  }

  useEffect(() => {

  }, [])

  const handleSave = async () => {
    let username = usernameInput

    // Remove dashes at the start or end of the string.
    username.replace(/^-|-$/g, '')

    // if it's the same username just close the modal
    if (username === loggedInUser.username) setIsUserSettingsModal(false)

    // check if username already taken
    const user = await fetchUserByUsername(username)
    if (user) {
      setUsernameInput('')
      usernameInputRef.current.placeholder = "username already taken"
      return
    } else {

      // update firebase
      await updateUserUsername({ userId: loggedInUser.id, username })

      // update internal state
      setSelectedUserUsername(username)
      setLoggedInUser({
        ...loggedInUser,
        username
      })

      // close modal
      setIsUserSettingsModal(false)

      // update url
      router.push(`/user/${username}`)
    }

  }

  return (
    <StandardModal
      title={"User Settings"}
      setIsModelOpen={setIsUserSettingsModal}
    >
      <input type="text" ref={usernameInputRef} placeholder={"@username"} onChange={handleUsernameChange} value={usernameInput} className={styles.input} />
      <div className={styles.save} onClick={handleSave}>+ save</div>
    </StandardModal>
  )
}

function sanitizeString(str) {
  return str
    .replace(/[^a-zA-Z0-9 -]+/g, '')   // Remove characters that are not alphanumeric, dashes, or spaces.
    .replace(/\s+/g, '-')              // Replace all spaces with a single dash.
    .toLowerCase();                   // Convert the string to lowercase.
}

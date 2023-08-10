import { useStore } from "@/utils/store"
import { useEffect } from "react"

export default function RoomWrapper({ children }) {
  const loggedInUser = useStore((state) => state.loggedInUser)
  const setSelectedUserUsername = useStore(state => state.setSelectedUserUsername)

  useEffect(() => {
    // selected user username is required for 
    // the modal that changes username
    if (loggedInUser) setSelectedUserUsername(loggedInUser.username)
  }, [loggedInUser, setSelectedUserUsername])

  return (
    <>
      {children}
    </>
  )
}
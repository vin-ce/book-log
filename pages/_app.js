import Layout from "@/components/layout"

import { useStore } from "../utils/store"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserById } from "../utils/firestore"

const auth = getAuth()

export default function MyApp({ Component, pageProps }) {

  // sets logged in or out states

  const loggedInUser = useStore((state) => state.loggedInUser)
  const setLoggedInUser = useStore((state) => state.setLoggedInUser)
  const setLoggedOut = useStore((state) => state.setLoggedOut)

  // tracks global log in / out state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!loggedInUser || user.uid !== loggedInUser.id) {
        const userData = await fetchUserById(user.uid)
        setLoggedInUser({ ...userData })
      }
    }
    else setLoggedOut()
  });

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
import Layout from "@/components/layout"
import "./globals.sass"

import { useStore } from "../utils/store"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchUserById } from "../utils/firestore"
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const auth = getAuth()


export default function MyApp({ Component, pageProps }) {

  // sets logged in or out states

  const loggedInUser = useStore((state) => state.loggedInUser)
  const setLoggedInUser = useStore((state) => state.setLoggedInUser)
  const setLoggedOut = useStore((state) => state.setLoggedOut)

  const [ready, setReady] = useState(false)

  // tracks global log in / out state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (!loggedInUser || user.uid !== loggedInUser.id) {
        const userData = await fetchUserById(user.uid)
        setLoggedInUser({ ...userData })
      }
    }
    else {
      setLoggedOut()
    }

    if (!ready) setReady(true)
  });

  return (
    <>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <title>messy table</title>
      </Head>
      {
        ready
          ?
          <Layout>
            <Component {...pageProps} />
          </Layout>
          : null
      }
    </>
  )
}
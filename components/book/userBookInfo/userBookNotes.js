import { useStore } from "@/utils/store"
import styles from "./userBookNotes.module.sass"
import TweetEmbed from "react-tweet-embed"

export default function UserBookNotes() {

  const loggedInUser = useStore((state) => state.loggedInUser)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)


  return (
    <div className={styles.container}>
      <div className={styles.label}>sticky notes:</div>
      <div className={styles.notesContainer}>
        <TweetNote tweetId={"1677871663893848067"} />
      </div>
      {/* <blockquote class="twitter-tweet" data-dnt="true"><p lang="en" dir="ltr">1860s female archery outfit with a score journal hanging from the belt <a href="https://t.co/XuBuRn0E3W">pic.twitter.com/XuBuRn0E3W</a></p>&mdash; Adrian Black (@MsAdrianBlack) <a href="https://twitter.com/MsAdrianBlack/status/1677871663893848067?ref_src=twsrc%5Etfw">July 9, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> */}
    </div>
  )
}


function TweetNote({ tweetId }) {
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)

  return (
    <div className={styles.noteContainer}>
      <div className={styles.dot}></div>
      <TweetEmbed tweetId={tweetId} options={{ conversation: "none", dnt: "true" }} />
    </div>
  )

}

function TextNote() {
  const isAuthorizedForUserBook = useStore((state) => state.isAuthorizedForUserBook)

  return (
    <div className={styles.noteContainer}>
      <div className={styles.dot}></div>
      <div></div>
    </div>
  )
}
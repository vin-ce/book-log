import RoomInfo from "@/components/room/roomInfo/roomInfo"
import styles from "./roomPage.module.sass"
import Room from "@/components/room/room"
import { useEffect, useRef, useState } from "react"
import { ResetStates } from "@/utils/helpers"
import { useStore } from "@/utils/store"
import { fetchRoom } from "@/utils/realtime"
import { useRouter } from "next/router"
import Link from "next/link"
import LiveCursor from "@/components/room/liveCursor/liveCursor"
import LiveCursorController from "@/components/room/liveCursor/liveCursorController.js/liveCursorController"



export default function RoomPage() {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const setSelectedRoomInfo = useStore((state) => state.setSelectedRoomInfo)
  const setSelectedRoomNotes = useStore((state) => state.setSelectedRoomNotes)
  const setIsRoomAdmin = useStore((state) => state.setIsRoomAdmin)
  const loggedInUser = useStore((state) => state.loggedInUser)

  const [ready, setReady] = useState(false)
  const router = useRouter()
  useEffect(() => {
    if (!ready && router.isReady) init()
    async function init() {
      const roomId = router.query.id
      const data = await fetchRoom(roomId)
      if (data) {
        setSelectedRoomInfo(data.roomInfo)
        setSelectedRoomNotes(data.notes)
        console.log("data", loggedInUser, data)
        if (loggedInUser && data.roomInfo.creatorId === loggedInUser.id) setIsRoomAdmin(true)
      }
      setReady(true)
    }
  }, [ready, router.isReady, router.query.id, setSelectedRoomInfo, setSelectedRoomNotes])


  const mouseMoveFuncRef = useRef(null)
  const handleMouseMove = (e) => {
    if (mouseMoveFuncRef.current) mouseMoveFuncRef.current(e)
  }

  return (
    <>
      {ready ?

        selectedRoomInfo
          ?
          <>
            <div className={styles.background} onMouseMove={handleMouseMove}>
              <div className={styles.container} >
                <RoomInfo />
                <Room />

              </div>
            </div>

            <LiveCursorController />
            <LiveCursor mouseMoveFuncRef={mouseMoveFuncRef} />

          </>
          :
          <div className={styles.errorContainer}>room not found! return <Link href="/room" className={styles.button}>home</Link> </div>

        :
        <div className={styles.errorContainer}>loading...</div>
      }

      <ResetStates />

    </>
  )
}

const data = {

  users: {
    userId: {
      rooms: {
        roomId: {
          id: ""
        },
      }
    }
  },

  rooms: {
    roomId: {
      title: "name",
      description: "",
      coverImageUrl: "",

      creatorId: "",
      adminIds: [
        "userId",
        "userId",
      ],
      createdTimestamp: "",
      lastedUpdatedTimestamp: "",
      // if yes, check members to determine editing rights 
      restricted: false,
    }
  },

  members: {
    roomId: {
      userId: true,
    }
  },

  notes: {
    roomId: {
      noteId: {
        type: "twitter",
        tweetId: "",

        sectionId: "",
        creatorId: "",
        createdTimestamp: "",
      },
      noteId: {
        type: "text",
        content: "",

        sectionId: "",
        creatorId: "",
        createdTimestamp: "",
      },
    }
  },

  sections: {
    roomId: {
      sectionId: {
        id: "",
        name: "",
        createdTimestamp: ""
      }
    }
  },

  // open / collapse state
  sectionOpenState: {
    roomId: {
      sectionId: true,
    }
  },

  liveCursors: {
    roomId: {
      // if userId !== null, it's active
      userId: "",
      // relative to central container
      x: "",
      y: "",
    }
  }

}
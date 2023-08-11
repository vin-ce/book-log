import { useFreshRef } from "@/hooks/useFreshRef"
import styles from "./liveCursor.module.sass"
import LiveCursorIcon from "@/public/icons/LiveCursor.svg"

import { realtimeDB, toggleLiveCursorUser, updateLiveCursor } from "@/utils/realtime"
import { useStore } from "@/utils/store"
import { onValue, ref } from "firebase/database"
import { useEffect, useRef, useState } from "react"


export default function LiveCursor({ mouseMoveFuncRef }) {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const loggedInUser = useStore((state) => state.loggedInUser)

  // use store state
  const activeLiveCursorUserId = useStore((state) => state.activeLiveCursorUserId)
  const setActiveLiveCursorUserId = useStore((state) => state.setActiveLiveCursorUserId)

  // local state -> this updates in the realtime db onValue callback
  const [activeCursorId, setActiveCursorId] = useFreshRef(activeLiveCursorUserId, setActiveLiveCursorUserId)

  const isUserActiveCursor = useRef(false)

  const cursorRef = useRef(null)
  const [cursorPos, setCursorPos] = useState(null)
  const isCursorHidden = useRef(true)


  // realtime db handling
  useEffect(() => {
    if (selectedRoomInfo) {
      const roomCursorRef = ref(realtimeDB, `liveCursors/${selectedRoomInfo.roomId}`)
      onValue(roomCursorRef, snap => {
        const data = snap.val()
        if (data) {

          // update live cursor user
          if (data.userId !== activeCursorId.current) {

            setActiveCursorId(data.userId)
            if (loggedInUser) {
              if (data.userId === loggedInUser.id) {
                // no need to update if the logged in user is the active user
                isUserActiveCursor.current = true
                return
              } else {
                if (isUserActiveCursor.current) isUserActiveCursor.current = false
              }
            }
          }

          // update cursor pos
          const fromLeft = (window.innerWidth - 800) / 2
          const x = data.x + fromLeft
          const y = data.y
          setCursorPos({ x, y })
        }
      })
    }
  }, [])

  useEffect(() => {
    // so cursor doesn't cause horizontal scroll
    document.querySelector("body").style.overflowX = "hidden"

    return () => {
      // disconnect cursor on close
      if (loggedInUser && isUserActiveCursor.current) toggleLiveCursorUser({ roomId: selectedRoomInfo.roomId, userId: loggedInUser.id, type: "off" })
    }
  }, [])



  // gets mouse move listener
  mouseMoveFuncRef.current = handleMouseMove

  // wait throttles it
  const wait = useRef(false)

  // updates mouse location data in realtime db
  function handleMouseMove(e) {

    if (!loggedInUser) return
    if (activeCursorId.current !== loggedInUser.id) return

    if (!wait.current) {
      // take away width of central container
      const fromLeft = (window.innerWidth - 800) / 2

      // x position is standardised relative to central container
      // in the realtime db
      updateLiveCursor({
        roomId: selectedRoomInfo.roomId,
        x: e.pageX - fromLeft,
        y: e.pageY
      })

      wait.current = true

      setTimeout(() => {
        wait.current = false
      }, 50)

    }
  }



  // sets cursor styles
  useEffect(() => {
    // if there is a active cursor + there is cursor data + user is not active user
    if (activeCursorId.current && cursorPos && !isUserActiveCursor.current) {
      // set cursor position styles
      cursorRef.current.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`
      // show cursor
      if (isCursorHidden.current) {
        cursorRef.current.classList.remove(styles.hidden)
        isCursorHidden.current = false
      }
    } else {
      // hide cursor
      if (!isCursorHidden.current) {
        cursorRef.current.classList.add(styles.hidden)
        isCursorHidden.current = true
      }
    }

  }, [activeCursorId.current, cursorPos, loggedInUser])



  return (
    <div className={[styles.cursor, styles.hidden].join(' ')} ref={cursorRef}>
      <LiveCursorIcon />
    </div>
  )
}
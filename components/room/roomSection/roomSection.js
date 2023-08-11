import React, { Fragment, useEffect, useRef, useState } from "react"
import styles from "./roomSection.module.sass"
import { CreateRoomTextNoteModal } from "@/components/modals/createNoteModals/createNoteModals"
import { realtimeDB, updateSectionOpenState } from "@/utils/realtime"
import { onValue, ref } from "firebase/database"
import { useStore } from "@/utils/store"
import { fetchUserById } from "@/utils/firestore"
import { RoomTextNote } from "@/components/noteModules/noteModules"
import DeleteRoomSectionModal from "@/components/modals/deleteModals/deleteRoomSectionModal/deleteRoomSectionModal"
import { useFreshRef } from "@/hooks/useFreshRef"

export default function RoomSection({ id, name }) {

  const [notes, setNotes] = useState(null)


  // ==============================
  // EXPAND / COLLAPSE SECTION

  const [isExpanded, setIsExpanded] = useFreshRef(false)

  const [isSetUp, setIsSetUp] = useState(false)
  useEffect(() => {
    if (notes && !isSetUp) {
      setIsSetUp(true)
      // keeps track of if section is expanded or not
      const sectionExpandRef = ref(realtimeDB, `sectionOpenState/${selectedRoomInfo.roomId}/${id}`)
      onValue(sectionExpandRef, snap => {
        const isExpand = snap.val()
        toggleExpandCollapse(isExpand)
      })
    }

    // every time the notes change
    // update height
    if (notes) {
      if (!isExpanded.current) triggerToggleExpandCollapse(true)
      else expand()
    }
  }, [isSetUp, notes])


  const sectionRef = useRef(null)
  const contentRef = useRef(null)

  function triggerToggleExpandCollapse(isExpand) {
    console.log("attempting to update", isExpand, isExpanded.current)
    updateSectionOpenState({ roomId: selectedRoomInfo.roomId, sectionId: id, state: isExpand })
  }

  function toggleExpandCollapse(isExpand) {
    console.log("expanding collapsing", name, isExpand, isExpanded.current)

    if (isExpand) expand()
    else collapse()

    if (isExpanded.current !== isExpand) setIsExpanded(isExpand)

  }

  function expand() {
    // 24px is to account for section header
    sectionRef.current.style.height = `${contentRef.current.offsetHeight + 24}px`
  }

  function collapse() {
    sectionRef.current.style.height = "24px"
  }



  // ======================
  // CREATING NOTES EL

  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const isRoomAdmin = useStore((state) => state.isRoomAdmin)

  const [isDeleteSectionModal, setIsDeleteSectionModal] = useState(false)

  const [isCreateNoteModal, setIsCreateNoteModal] = useState(false)


  // {
  //   userId: username,
  // }
  const usernames = useRef({})

  useEffect(() => {

    const roomNotesRef = ref(realtimeDB, `notes/${selectedRoomInfo.roomId}/${id}`)
    onValue(roomNotesRef, async snap => {
      const data = snap.val()

      // if there is data
      if (data) {
        // sort notes by name
        const sortedNotes = await sortNotesIntoArrayByUser({ notes: data, usernames: usernames })

        const el = []


        sortedNotes.forEach(usernamesNotes => {

          const creatorId = usernamesNotes[0].creatorId
          let isLoggedInUserCreator = false
          if (loggedInUser && creatorId === loggedInUser.id) isLoggedInUserCreator = true

          // name section heading
          el.push(
            <div className={styles.nameHeader} key={`section-${id}_user-${creatorId}_header`}>
              <div className={styles.username}>{usernames.current[creatorId]}</div>
              {
                isLoggedInUserCreator ?
                  <div className={styles.button} onClick={() => setIsCreateNoteModal(true)}>+</div>
                  : null
              }
            </div>
          )

          const notesEl = []
          usernamesNotes.forEach(note => {

            // notes under a name
            notesEl.push(
              <React.Fragment key={`section-${note.sectionId}_note-${note.noteId}`}>
                <RoomTextNote
                  content={note.content}
                  createdTimestampSeconds={note.createdTimestamp}
                  sectionId={note.sectionId}
                  noteId={note.noteId}
                  isAuthorized={isLoggedInUserCreator}
                />
              </React.Fragment>
            )
          })

          // notes grid
          el.push(
            <div className={styles.notesGrid} key={`section-${id}_user-${creatorId}_notesGrid`}>
              {notesEl}
            </div>
          )


        })

        // full notes el
        setNotes(el)

      } else {
        setNotes(
          <div className={styles.errorContainer}>no notes found</div>
        )
      }
    })
  }, [])


  return (
    <>
      <div className={styles.container} ref={sectionRef}>
        <div className={styles.header}>
          <div className={styles.name}>{name}</div>
          <div className={styles.buttonsContainer}>
            {
              isRoomAdmin ?
                <div className={styles.button} onClick={() => setIsDeleteSectionModal(true)}>x</div>
                : null
            }
            {
              loggedInUser ?
                <div className={styles.button} onClick={() => setIsCreateNoteModal(true)}>+ note</div>
                : null
            }
            <div className={styles.button} onClick={() => triggerToggleExpandCollapse(!isExpanded.current)}>{isExpanded.current ? "↑" : "↓"}
            </div>
          </div>
        </div>
        <div className={styles.notesContainer} ref={contentRef}>
          {notes}
        </div>
      </div>

      {
        isCreateNoteModal ? <CreateRoomTextNoteModal sectionId={id} setIsModal={setIsCreateNoteModal} /> : null
      }

      {
        isDeleteSectionModal ? <DeleteRoomSectionModal sectionId={id} setIsDeleteModal={setIsDeleteSectionModal} /> : null
      }
    </>
  )
}



// =================
// HELPER FUNCS

async function sortNotesIntoArrayByUser({ notes, usernames }) {

  // groups objects by creatorId
  const objGroupedByUserId = Object.values(notes, usernames).reduce((acc, obj) => {
    const creatorId = obj.creatorId;
    if (!acc[creatorId]) {
      acc[creatorId] = [];
    }
    acc[creatorId].push(obj);
    return acc;
  }, {});

  // fetches and stores usernames
  const creatorIdArr = Object.keys(objGroupedByUserId)
  await Promise.all(creatorIdArr.map(async (creatorId) => {
    // check if it's in username
    let username = usernames.current.creatorId
    if (!username) {
      const user = await fetchUserById(creatorId)
      username = user.username
      usernames.current[creatorId] = username
    }
  }));

  // convert the grouped-by-creator-id objects into an array of arrays
  const arrayOfArrays = Object.values(objGroupedByUserId);
  return arrayOfArrays
}
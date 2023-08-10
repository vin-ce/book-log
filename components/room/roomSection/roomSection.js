import React, { Fragment, useEffect, useRef, useState } from "react"
import styles from "./roomSection.module.sass"
import { CreateRoomTextNoteModal } from "@/components/modals/createNoteModals/createNoteModals"
import { realtimeDB, updateSectionOpenState } from "@/utils/realtime"
import { onValue, ref } from "firebase/database"
import { useStore } from "@/utils/store"
import { fetchUserById } from "@/utils/firestore"
import { RoomTextNote } from "@/components/noteModules/noteModules"
import DeleteRoomSectionModal from "@/components/modals/deleteModals/deleteRoomSectionModal/deleteRoomSectionModal"

export default function RoomSection({ id, name }) {
  const selectedRoomInfo = useStore((state) => state.selectedRoomInfo)
  const loggedInUser = useStore((state) => state.loggedInUser)
  const isRoomAdmin = useStore((state) => state.isRoomAdmin)

  const [isExpanded, setIsExpanded] = useState(true)
  const [isDeleteSectionModal, setIsDeleteSectionModal] = useState(false)

  const [isCreateNoteModal, setIsCreateNoteModal] = useState(false)
  const [notes, setNotes] = useState([])


  // {
  //   userId: username,
  // }
  const usernames = useRef({})

  // CREATING NOTES EL
  useEffect(() => {

    const roomNotesRef = ref(realtimeDB, `notes/${selectedRoomInfo.roomId}/${id}`)
    onValue(roomNotesRef, async snap => {
      const data = snap.val()
      console.log("full data", data)
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



    // keeps track of if section is expanded or not
    const sectionExpandRef = ref(realtimeDB, `sectionOpenState/${selectedRoomInfo.roomId}/${id}`)
    onValue(sectionExpandRef, snap => {
      const data = snap.val()
      setIsExpanded(data)
    })

  }, [])



  const handleExpandCollapse = () => {
    // update in db
    updateSectionOpenState({ roomId: selectedRoomInfo.roomId, sectionId: id, state: !isExpanded })

    // update in state
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <div className={styles.container}>
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
            <div className={styles.button} onClick={handleExpandCollapse}>{isExpanded ? "↑" : "↓"}
            </div>
          </div>
        </div>
        <div className={styles.notesContainer}>
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
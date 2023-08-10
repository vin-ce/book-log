

import { child, get, getDatabase, ref, remove, set, update } from "firebase/database";

import { firebaseApp } from "./firebaseConfig";
import { removeEmptyProperties } from "./helpers";
const db = getDatabase(firebaseApp);
export const realtimeDB = db


export async function createRoom({ userId, roomData }) {
  const roomId = generateUniqueID("room")
  const timestamp = getCurrentTimestampInSeconds()
  set(ref(db, `rooms/${roomId}`), {
    ...roomData,

    roomId,
    creatorId: userId,
    adminIds: [userId],
    createdTimestamp: timestamp,
    lastUpdatedTimestamp: timestamp,
    restricted: false,

  })

  addRoomToUser({ userId, roomId })

  return roomId
}

export async function updateRoom({ roomId, roomData }) {
  update(ref(db, `rooms/${roomId}`), roomData)
}

export async function updateRoomLastUpdated(roomId) {
  const timestamp = getCurrentTimestampInSeconds()
  update(ref(db, `rooms/${roomId}`), {
    lastUpdatedTimestamp: timestamp
  })
}

export async function fetchRoom(roomId) {
  const dbRef = ref(db)


  // room info
  const roomInfoSnap = await get(child(dbRef, `rooms/${roomId}`))

  if (roomInfoSnap.exists()) {

    // notes in room
    const notesSnap = await get(child(dbRef, `notes/${roomId}`))

    let roomInfo = roomInfoSnap.val()
    let notes
    if (notesSnap.exists()) notesSnap.val()

    return {
      roomInfo,
      notes
    }

  } else {
    return null
  }

}

export async function fetchRoomsOfUser({ userId }) {
  const dbRef = ref(db)
  // get list of rooms id that user is in
  const roomsOfUserSnap = await get(child(dbRef, `users/${userId}/rooms`))

  let roomsData = []

  if (roomsOfUserSnap.exists()) {
    // turn object into array
    const roomsIdArr = Object.values(roomsOfUserSnap.val())

    // get data of rooms in id list
    await Promise.all(roomsIdArr.map(async (room) => {
      const roomSnap = await get(child(dbRef, `rooms/${room.id}`))
      if (roomSnap.exists()) roomsData.push(roomSnap.val())
    }));

  }

  return roomsData
}

export async function addRoomToUser({ roomId, userId }) {
  set(ref(db, `users/${userId}/rooms/${roomId}`), {
    id: roomId
  })
  set(ref(db, `members/${roomId}/${userId}`), {
    id: userId
  })
}

export async function removeRoomFromUser({ roomId, userId }) {
  remove(ref(db, `users/${userId}/rooms/${roomId}`))
  remove(ref(db, `members/${roomId}/${userId}`))
}

export async function checkIsUserInRoom({ roomId, userId }) {
  const dbRef = ref(db)
  const userSnap = await get(child(dbRef, `members/${roomId}/${userId}`))
  return userSnap.exists()
}

export async function deleteRoom(roomId) {
  remove(ref(db, `rooms/${roomId}`))
  remove(ref(db, `notes/${roomId}`))
  remove(ref(db, `sections/${roomId}`))
  remove(ref(db, `sectionOpenState/${roomId}`))
  remove(ref(db, `liveCursors/${roomId}`))


  const dbRef = ref(db)
  // TO DO
  const membersOfRoomSnap = await get(child(dbRef, `members/${roomId}`))
  if (membersOfRoomSnap.exists()) {
    const membersIdArr = Object.values(membersOfRoomSnap.val())
    await Promise.all(membersIdArr.map(async (member) => {
      await remove(ref(db, `users/${member.id}/rooms/${roomId}`))
    }));
  }

  remove(ref(db, `members/${roomId}`))

}


export async function createSection({ roomId, sectionName }) {
  const sectionId = generateUniqueID("section")
  const timestamp = getCurrentTimestampInSeconds()
  set(ref(db, `sections/${roomId}/${sectionId}`), {
    name: sectionName,
    id: sectionId,
    createdTimestamp: timestamp,
  })
  set(ref(db, `sectionOpenState/${roomId}/${sectionId}`), true)

  updateRoomLastUpdated(roomId)
}

export async function updateSectionOpenState({ roomId, sectionId, state }) {
  update(ref(db, `sectionOpenState/${roomId}`), {
    [sectionId]: state
  })
}

export async function deleteSection({ roomId, sectionId }) {
  remove(ref(db, `sections/${roomId}/${sectionId}`))
  remove(ref(db, `sectionOpenState/${roomId}/${sectionId}`))
  remove(ref(db, `notes/${roomId}/${sectionId}`))

  updateRoomLastUpdated(roomId)
}

export async function createRoomNote({ userId, roomId, sectionId, type, tweetId, content }) {
  const noteId = generateUniqueID("note")
  const timestamp = getCurrentTimestampInSeconds()

  const noteData = removeEmptyProperties({
    type,
    tweetId,
    content,
    noteId,
    sectionId,
    creatorId: userId,
    createdTimestamp: timestamp,
  })

  update(ref(db, `notes/${roomId}/${sectionId}`), {
    [noteId]: noteData
  })

  updateRoomLastUpdated(roomId)

  return noteId
}

export async function deleteRoomNote({ roomId, sectionId, noteId }) {
  remove(ref(db, `notes/${roomId}/${sectionId}/${noteId}`))
}


export async function toggleLiveCursorUser({ roomId, userId, type }) {
  if (type === "on") {
    update(ref(db, `liveCursors/${roomId}`), {
      userId
    })
  } else if (type === "off") {
    update(ref(db, `liveCursors/${roomId}`), {
      userId: null,
      x: 0,
      y: 0,
    })
    // turn off, remove userId
  }
}

export async function updateLiveCursor({ roomId, x, y }) {
  update(ref(db, `liveCursors/${roomId}`), {
    x,
    y,
  })
}

// -----------------
// HELPER FUNCS


function generateUniqueID(type) {
  const timestamp = new Date().getTime();
  const randomPartLength = 8;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';

  for (let i = 0; i < randomPartLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomPart += characters.charAt(randomIndex);
  }

  const id = `${type}-${timestamp}-${randomPart}`;
  return id;
}

function getCurrentTimestampInSeconds() {
  const timestampInSeconds = Math.floor(new Date().getTime() / 1000);
  return timestampInSeconds;
}
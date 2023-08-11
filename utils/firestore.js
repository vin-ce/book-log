

import { getFirestore, collection, setDoc, doc, getDoc, getDocs, where, query, updateDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy, limit, deleteDoc, startAfter, getCountFromServer, addDoc } from "firebase/firestore";

import { firebaseApp } from "./firebaseConfig";
import { removeEmptyProperties } from "./helpers";
const db = getFirestore(firebaseApp);


// =========
// USER

export async function createUser(userData) {

  // check if user is already in db
  const docSnap = await getDoc(doc(db, "users", userData.id))

  // if user does not exist, create user
  if (!docSnap.exists()) {

    const username = await createUsername(userData.displayName)

    await setDoc(doc(db, "users", userData.id), {
      ...userData,
      username: username,
      createdTimestamp: serverTimestamp(),

      // keeps track of bookId status
      toRead: [],
      reading: [],
      read: [],
    }, { merge: true })

  }
}

async function createUsername(name) {
  // retains only alphanumeric + replaces spaces with a dash
  const BASE_USERNAME = name.replace(/[^a-zA-Z0-9\s]+/g, "").replace(/\s+/g, "-").toLowerCase()
  let newUsername = BASE_USERNAME

  // check if username is taken 
  const MAX_CHECK_ATTEMPTS = 5

  for (let curCheckAttempt = 0; curCheckAttempt < MAX_CHECK_ATTEMPTS; curCheckAttempt++) {
    // tries find username
    const q = query(collection(db, "users"), where("username", "==", newUsername))
    const querySnapshot = await getDocs(q);

    let foundDoc;
    querySnapshot.forEach((doc) => { foundDoc = doc.id });

    if (!foundDoc) {
      // if doc isn't found i.e username is valid, return new username
      return newUsername
    } else {
      // generates a username that is base username + random 5 char alphanumeric string
      const randomString = generateRandomString()
      newUsername = BASE_USERNAME + "-" + randomString
    }
  }
}

function generateRandomString() {
  const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const NUM_OF_CHAR = 5
  let randomString = '';

  for (let i = 0; i < NUM_OF_CHAR; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    randomString += CHARACTERS.charAt(randomIndex);
  }

  return randomString;
}

export async function updateUserUsername({ userId, username }) {
  await updateDoc(doc(db, "users", userId), {
    username
  })
}

export async function fetchUserById(userId) {

  const docSnap = await getDoc(doc(db, "users", userId))
  // this should always be true
  if (docSnap.exists()) {
    const data = docSnap.data()
    return data
  } else {
    return null
  }

}

export async function fetchUserByUsername(username) {
  const querySnapshot = await getDocs(query(collection(db, "users"), where("username", "==", username)))

  let user;
  querySnapshot.forEach((doc) => {
    user = doc.data()
  })

  if (user) {
    return user
  } else {
    return null
  }
}


export async function checkIfEmailIsInvited(email) {
  const docSnap = await getDoc(doc(db, "admin", "authorizedUserEmails"))
  return docSnap.data().emails.includes(email)
}

// =========
// BOOK

// check if book is in database
export async function checkHasBookData({ bookId, bookData }) {
  const bookSnap = await getDoc(doc(db, "books", bookId))
  const userBookSnap = await getDocs(collection(db, "books", bookId, "users"), limit(1))

  let hasUsers = false
  userBookSnap.forEach(user => hasUsers = true)

  // if has users but no book data
  if (hasUsers && !bookSnap.data()) addBookData({ bookId, bookData })
  else return
}

export async function addBookData({ bookId, bookData }) {
  // firebase can't accept values that are undefined 
  const cleanedBookData = removeEmptyProperties(bookData)
  await setDoc(doc(db, "books", bookId), cleanedBookData, { merge: true })
}

export async function addBookToShelf({ bookId, shelfId, userId }) {

  // book is already added
  const docSnap = await getDoc(doc(db, "shelves", shelfId, "books", bookId))
  if (docSnap.exists()) return

  await setDoc(doc(db, "shelves", shelfId, "books", bookId), {
    id: bookId,
    addedTimestamp: serverTimestamp(),
  }, { merge: true })

  await updateDoc(doc(db, "shelves", shelfId), {
    lastUpdatedTimestamp: serverTimestamp(),
    order: arrayUnion(bookId)
  })


  // add shelf to user's book data
  await setDoc(doc(db, "books", bookId, "users", userId), {
    shelves: arrayUnion(shelfId)
  }, { merge: true })

  return
}

export async function removeBookFromShelf({ bookId, shelfId, userId }) {

  await deleteDoc(doc(db, "shelves", shelfId, "books", bookId))

  await updateDoc(doc(db, "shelves", shelfId), {
    lastUpdatedTimestamp: serverTimestamp(),
    order: arrayRemove(bookId)
  })

  await updateDoc(doc(db, "books", bookId, "users", userId), {
    shelves: arrayRemove(shelfId)
  })

}


// to read / read / reading

export async function fetchBooksWithStatus({ userId }) {
  const userData = await fetchUserById(userId)

  return (
    {
      toRead: userData.toRead,
      reading: userData.reading,
      read: userData.read,
    }
  )

}


export async function fetchBookById(bookId) {
  const bookSnap = await getDoc(doc(db, "books", bookId))
  if (bookSnap.exists()) return bookSnap.data()
  else return null
}


export async function fetchBooksFromIdList(arr) {

  const booksData = []

  for (let i = 0; i < arr.length; i++) {
    const bookData = await fetchBookById(arr[i]
    )
    if (bookData) booksData.push(bookData)
  }

  return booksData

}


export async function fetchBooksOfStatus({ userId, status }) {
  const userSnap = await getDoc(doc(db, "users", userId))
  if (userSnap.exists()) {
    const userData = userSnap.data()

    let booksIdList = []

    switch (status) {
      case "toRead": {
        booksIdList = [...userData.toRead]
        break
      }
      case "reading": {
        booksIdList = [...userData.reading]
        break
      }
      case "read": {
        booksIdList = [...userData.read]
        break
      }
      default: {
        console.log("ERROR: sorting books of status")
        break
      }
    }

    const booksData = await fetchBooksFromIdList(booksIdList)


    const shelfBooksData = []

    booksData.forEach(bookData => {
      shelfBooksData.push(bookData)
    })

    const updatedBooksData = [];

    await Promise.all(shelfBooksData.map(async (book) => {
      const fullBookData = await fetchBookById(book.id)
      const bookUserData = await fetchUserBookInfo({ bookId: book.id, userId })

      updatedBooksData.push({
        ...book,
        status: bookUserData.status,
        rating: bookUserData.rating,
        notes: bookUserData.notes,
        ...fullBookData,
      })

    }));


    return updatedBooksData


  } else {
    return null
  }
  // await getDocs(collection(db, "books"))
}



// MATERIAL

export async function createMaterial({ userId, materialData, status }) {
  const cleanedMaterialData = removeEmptyProperties(materialData)
  const newBookRef = doc(collection(db, "books"))
  await setDoc(newBookRef, {
    ...cleanedMaterialData,
    id: newBookRef.id,
    createdTimestamp: serverTimestamp(),
  })
  await updateUserBookStatus({ bookId: newBookRef.id, userId, status })
  return newBookRef.id
}

export async function updateMaterial({ materialId, materialData }) {
  const cleanedMaterialData = removeEmptyProperties(materialData)
  const materialRef = doc(db, "books", materialId)
  await updateDoc(materialRef, {
    ...cleanedMaterialData,
  })
  return
}

export async function deleteUserMaterialData({ materialId, userId, status }) {

  // removes material from status data in user
  const userRef = doc(db, "users", userId)
  switch (status) {
    case "toRead":
      await updateDoc(userRef, { toRead: arrayRemove(materialId) })
      break
    case "reading":
      await updateDoc(userRef, { reading: arrayRemove(materialId) })
      break
    case "read":
      await updateDoc(userRef, { read: arrayRemove(materialId) })
      break
  }

  // remove book from all shelves that contain it
  const userMaterialRef = doc(db, "books", materialId, "users", userId)

  const userMaterialDataSnap = await getDoc(userMaterialRef)
  const shelfIdList = userMaterialDataSnap.data().shelves

  if (shelfIdList) {
    await Promise.all(shelfIdList.map(async (shelfId) => {
      await removeBookFromShelf({ shelfId, userId, bookId: materialId })
    }));
  }

  // delete notes from books>users>notes
  const notesSnap = await getDocs(collection(db, "books", materialId, "users", userId, "notes"))
  const notesIdList = []
  notesSnap.forEach(note => notesIdList.push(note.id))

  await Promise.all(notesIdList.map(async (noteId) => {
    await deleteNote({ userId, bookId: materialId, noteId })
  }));

  // delete userBook info from books>users
  await deleteDoc(userMaterialRef)

}




// ==========
// SHELF


export async function fetchAllUserShelves({ userId }) {

  const q = query(collection(db, "shelves"), where("creatorId", "==", userId), orderBy("name", "asc"))

  const shelvesSnap = await getDocs(q)
  const shelvesData = []
  shelvesSnap.forEach((doc) => {
    shelvesData.push({
      id: doc.id,
      name: doc.data().name
    })
  })

  return shelvesData

}


export async function fetchShelf(shelfId) {
  const shelfSnap = await getDoc(doc(db, "shelves", shelfId))
  if (shelfSnap.exists()) return shelfSnap.data()
  else return null
}


export async function fetchBooksInShelf({ shelfId, userId }) {
  // books in shelf
  const shelfBooksSnap = await getDocs(collection(db, "shelves", shelfId, "books"))

  const shelfBooksData = []

  shelfBooksSnap.forEach(doc => {
    const bookData = doc.data()
    shelfBooksData.push(bookData)
  })

  const updatedBooksData = [];

  await Promise.all(shelfBooksData.map(async (book) => {

    const fullBookData = await fetchBookById(book.id)
    const bookUserData = await fetchUserBookInfo({ bookId: book.id, userId })

    updatedBooksData.push({
      ...book,
      status: bookUserData.status,
      rating: bookUserData.rating,
      notes: bookUserData.notes,
      ...fullBookData,
    })

  }));


  return updatedBooksData
}

const MAX_NUM_OF_SHELVES = 5

export async function fetchShelvesPaginated({ userId, lastVisible, page }) {

  let q
  // query with pagination
  if (lastVisible) q = query(collection(db, "shelves"), where("creatorId", "==", userId), orderBy("lastUpdatedTimestamp", "desc"), startAfter(lastVisible), limit(MAX_NUM_OF_SHELVES))

  // query with first results
  else q = query(collection(db, "shelves"), where("creatorId", "==", userId), orderBy("lastUpdatedTimestamp", "desc"), limit(MAX_NUM_OF_SHELVES))

  const shelvesSnap = await getDocs(q)
  const shelvesData = []
  shelvesSnap.forEach((doc) => {
    shelvesData.push({
      id: doc.id,
      name: doc.data().name
    })
  })

  let newLastVisible

  // gets total num of shelves to know if hit limit
  let noLimitQuery = query(collection(db, "shelves"), where("creatorId", "==", userId))
  const countSnap = await getCountFromServer(noLimitQuery)
  const totalNumOfShelves = countSnap.data().count

  // if total is still more than the amount i'm fetching, get query cursor
  if (totalNumOfShelves > page * MAX_NUM_OF_SHELVES) newLastVisible = shelvesSnap.docs[shelvesSnap.docs.length - 1];
  // else return end of document 
  else newLastVisible = "EOD"

  return { shelvesData, newLastVisible, totalNumOfShelves }
}


export async function fetchShelvesFromIdList(shelfIdArray) {
  const shelvesData = []

  for (let i = 0; i < shelfIdArray.length; i++) {
    const shelfData = await fetchShelf(shelfIdArray[i])
    if (shelfData) shelvesData.push(shelfData)
  }

  return shelvesData
}



export async function createShelf({ shelfData, userId, bookId }) {

  // create shelf
  const shelfRef = doc(collection(db, "shelves"))
  const shelfId = shelfRef.id

  await setDoc(shelfRef, {
    ...shelfData,
    id: shelfId,
    creatorId: userId,
    createdTimestamp: serverTimestamp(),
    lastUpdatedTimestamp: serverTimestamp(),
    order: [],
  })


  // add book to shelf and shelf to book's shelves array
  if (bookId) {
    await addBookToShelf({ bookId, shelfId, userId })
  }

  return shelfId
}

export async function updateShelf({ shelfData, shelfId }) {
  await updateDoc(doc(db, "shelves", shelfId), shelfData)
}

export async function deleteShelf(shelfId) {

  // get list of books that is in shelf
  const booksInShelfSnap = await getDocs(collection(db, "shelves", shelfId, "books"))

  const booksIdList = []
  booksInShelfSnap.forEach((book) => {
    booksIdList.push(book.id)
  })

  // get creatorId of shelf
  const shelfSnap = await getDoc(doc(db, "shelves", shelfId))
  const creatorId = shelfSnap.data().creatorId


  await Promise.all(booksIdList.map(async (bookId) => {

    // remove shelf from the shelf arrays
    await updateDoc(doc(db, "books", bookId, "users", creatorId), {
      shelves: arrayRemove(shelfId)
    })

    // delete books collection from shelf
    await deleteDoc(doc(db, "shelves", shelfId, "books", bookId))

  }));

  await deleteDoc(doc(db, "shelves", shelfId))

  // delete shelf from shelves
}

export async function pinBookNoteInShelf({ shelfId, bookId, noteData }) {
  await updateDoc(doc(db, "shelves", shelfId, "books", bookId), {
    pinnedNote: noteData,
  })
}

export async function unpinBookNoteInShelf({ shelfId, bookId }) {
  await updateDoc(doc(db, "shelves", shelfId, "books", bookId), {
    pinnedNote: null,
  })
}



// ===================
// USER BOOK INFO

export async function fetchUserBookInfo({ bookId, userId }) {

  const userBookSnap = await getDoc(doc(db, "books", bookId, "users", userId))
  if (userBookSnap.exists()) {
    const bookData = userBookSnap.data()
    let notesData = await fetchBookNotes({ bookId, userId })

    // if there is pinned list
    if (bookData.pinnedNotes && bookData.pinnedNotes.length > 0) {
      const tempNotesData = [...notesData]

      // rearranges bookData array to have pinned at top
      bookData.pinnedNotes.forEach((pinnedNoteId, index) => {
        const currentIndex = tempNotesData.findIndex(obj => obj.id === pinnedNoteId)
        const newIndex = index
        const pinnedNoteData = tempNotesData[currentIndex]
        pinnedNoteData.pinned = true

        tempNotesData.splice(currentIndex, 1)
        tempNotesData.splice(newIndex, 0, pinnedNoteData)
      })
      notesData = tempNotesData
    }

    return {
      status: bookData.status,
      rating: bookData.rating,
      shelves: bookData.shelves,
      readDate: bookData.readDate,
      notes: notesData,
    }
  } else {
    return null
  }

}

export async function updateUserBookStatus({ bookId, userId, status }) {

  await setDoc(doc(db, "books", bookId, "users", userId), {
    status: status,
  }, { merge: true })

  switch (status) {
    case "toRead": {
      await updateDoc(doc(db, "users", userId), {
        toRead: arrayUnion(bookId),
        reading: arrayRemove(bookId),
        read: arrayRemove(bookId),
      })
      break
    }
    case "reading": {
      await updateDoc(doc(db, "users", userId), {
        toRead: arrayRemove(bookId),
        reading: arrayUnion(bookId),
        read: arrayRemove(bookId),
      })
      break
    }
    case "read": {
      await updateDoc(doc(db, "users", userId), {
        toRead: arrayRemove(bookId),
        reading: arrayRemove(bookId),
        read: arrayUnion(bookId),
      })
      break
    }
  }


}

export async function updateUserBookRating({ bookId, userId, rating }) {

  await setDoc(doc(db, "books", bookId, "users", userId), {
    rating,
  }, { merge: true })

}

export async function updateUserBookReadDate({ bookId, userId, readDate }) {

  await setDoc(doc(db, "books", bookId, "users", userId), {
    readDate,
  }, { merge: true })

}

// ==========
// NOTES

async function fetchBookNotes({ bookId, userId }) {

  const userBookNotesCollectionRef = collection(db, "books", bookId, "users", userId, "notes")

  const q = query(userBookNotesCollectionRef, orderBy("createdTimestamp", "desc"))

  const userBookNotesSnap = await getDocs(q)

  const userBookNotesData = []
  userBookNotesSnap.forEach((doc) => {
    userBookNotesData.push({ id: doc.id, ...doc.data() })
  })

  if (userBookNotesData.length == 0) {
    return null
  } else {
    return userBookNotesData
  }

}


export async function createNote({ bookId, userId, tweetId, content, type }) {

  let creationData
  if (type === "tweet") {

    creationData = {
      createdTimestamp: serverTimestamp(),
      type,
      tweetId,
    }

  } else if (type === "text") {

    creationData = {
      createdTimestamp: serverTimestamp(),
      type,
      content,
    }
  }

  const userBookNotesCollectionRef = collection(db, "books", bookId, "users", userId, "notes")

  const docRef = await addDoc(userBookNotesCollectionRef, creationData)

  const docSnap = await getDoc(docRef)
  const data = docSnap.data()

  return {
    id: docSnap.id,
    ...data
  }

}

export async function editTextNote({ bookId, userId, noteId, content }) {
  const userBookNoteRef = doc(db, "books", bookId, "users", userId, "notes", noteId)
  await updateDoc(userBookNoteRef, {
    content
  })
}

export async function deleteNote({ bookId, userId, noteId }) {
  const userBookNoteRef = doc(db, "books", bookId, "users", userId, "notes", noteId)
  await deleteDoc(userBookNoteRef)
  removePinnedNote({ bookId, userId, noteId })
}

export async function addPinnedNote({ bookId, userId, noteId }) {

  const userBookRef = doc(db, "books", bookId, "users", userId)

  const docSnap = await getDoc(userBookRef)
  if (docSnap.exists()) {
    const docData = docSnap.data()
    const pinnedNotes = docData.pinnedNotes
    if (pinnedNotes && pinnedNotes.length > 0) {
      await updateDoc(userBookRef, {
        pinnedNotes: [noteId, ...pinnedNotes]
      })
    } else {
      await updateDoc(userBookRef, {
        pinnedNotes: [noteId]
      })
    }
  }
}

export async function removePinnedNote({ bookId, userId, noteId }) {
  const userBookRef = doc(db, "books", bookId, "users", userId)

  await updateDoc(userBookRef, {
    pinnedNotes: arrayRemove(noteId)
  })
}

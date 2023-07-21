import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, setDoc, doc, getDoc, getDocs, where, query, updateDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy, limit, deleteDoc, startAfter, getCountFromServer, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLz-Bk7coVNRtQO8cUyEKGjSPGcTxeLws",
  authDomain: "book-log-392519.firebaseapp.com",
  projectId: "book-log-392519",
  storageBucket: "book-log-392519.appspot.com",
  messagingSenderId: "177953137158",
  appId: "1:177953137158:web:70d8543c535b506cbe9987"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


// ---------
// USER

export async function createUser(userData) {

  // check if user is already in db
  const docSnap = await getDoc(doc(db, "users", userData.id))

  // if user does not exist, create user
  if (!docSnap.exists()) {

    const username = await createUsername(userData.displayName)

    await setDoc(doc(db, "users", userData.id), {
      displayName: userData.displayName,
      username: username,
      email: userData.email,
      profileImageURL: userData.profileImageURL,
      id: userData.id,
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
    // console.log(doc.id, " => ", doc.data());
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

// ---------
// BOOK

async function fetchBookById(bookId) {
  const bookSnap = await getDoc(doc(db, "books", bookId))
  // specifically select title to check if there's book info
  // and not just user info attached to book
  // this is so that database can be relied upon rather than google book api
  // in larger calls for book info
  if (bookSnap.exists()) {
    return bookSnap.data().title
  } else {
    return null
  }
}

// check if book is in database
export async function checkHasBookData({ bookId, bookData }) {
  const hasBookData = await fetchBookById(bookId)
  if (hasBookData) return
  else await addBookData({ bookId, bookData })
}


function removeNullOrUndefinedProperties(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    }
  });
  return obj
}

export async function addBookData({ bookId, bookData }) {
  // firebase can't accept values that are undefined 
  const cleanedBookData = removeNullOrUndefinedProperties(bookData)
  await updateDoc(doc(db, "books", bookId), cleanedBookData)
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
  await updateDoc(doc(db, "books", bookId, "users", userId), {
    shelves: arrayUnion(shelfId)
  })

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


// ----------
// SHELF

export async function fetchShelf(shelfId) {
  const shelfSnap = await getDoc(doc(db, "shelves", shelfId))
  if (shelfSnap.exists()) return shelfSnap.data()
  else return null
}

const MAX_NUM_OF_SHELVES = 5

export async function fetchShelves({ userId, lastVisible, page }) {

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

export async function createShelf({ shelfName, userId, bookId }) {

  // create shelf
  const shelfRef = doc(collection(db, "shelves"))
  const shelfId = shelfRef.id

  await setDoc(shelfRef, {
    name: shelfName,
    id: shelfId,
    creatorId: userId,
    createdTimestamp: serverTimestamp(),
    lastUpdatedTimestamp: serverTimestamp(),
    order: [],
  })


  // add book to shelf and shelf to book's shelves array
  if (bookId) await addBookToShelf({ bookId, shelfId, userId })

  return shelfId
}

// USER BOOK INFO

export async function fetchUserBookInfo({ bookId, userId }) {

  const userBookSnap = await getDoc(doc(db, "books", bookId, "users", userId))
  if (userBookSnap.exists()) {
    const bookData = userBookSnap.data()
    let notesData = await fetchBookNotes({ bookId, userId })

    console.log("notes pre", notesData)
    // if there is pinned list
    if (bookData.pinnedNotes && bookData.pinnedNotes.length > 0) {
      const tempNotesData = [...notesData]

      // rearranges bookData array to have pinned 
      bookData.pinnedNotes.forEach((pinnedNoteId, index) => {
        const currentIndex = tempNotesData.findIndex(obj => obj.id === pinnedNoteId)
        const newIndex = index
        const pinnedNoteData = tempNotesData[currentIndex]
        pinnedNoteData.pinned = true

        tempNotesData.splice(currentIndex, 1)
        tempNotesData.splice(newIndex, 0, pinnedNoteData)
      })
      notesData = tempNotesData
      console.log("notes pinned", bookData.pinnedNotes, notesData)
    }

    return {
      status: bookData.status,
      rating: bookData.rating,
      shelves: bookData.shelves,
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

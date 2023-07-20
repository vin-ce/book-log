import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, setDoc, doc, getDoc, getDocs, where, query, updateDoc, serverTimestamp, arrayUnion, arrayRemove, orderBy, limit, deleteDoc, startAfter, getCountFromServer } from "firebase/firestore";

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
      id: userData.id
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
    console.log("user data", data)
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
  if (bookSnap.exists()) {
    return bookSnap.data()
  } else {
    return null
  }
}



export async function addBookData({ bookId, bookData }) {
  await setDoc(doc(db, "books", bookId), {

  }, { merge: true })
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
  if (lastVisible) q = query(collection(db, "shelves"), where("creatorId", "==", userId), orderBy("lastUpdatedTimestamp", "desc"), startAfter(lastVisible), limit(5))
  else q = query(collection(db, "shelves"), where("creatorId", "==", userId), orderBy("lastUpdatedTimestamp", "desc"), limit(MAX_NUM_OF_SHELVES))

  const shelvesSnap = await getDocs(q)
  const shelvesData = []
  shelvesSnap.forEach((doc) => {
    shelvesData.push({
      id: doc.id,
      name: doc.data().name
    })
  })

  // does not add lastVisible ref if less or equal to 5, 
  // i.e if no more docs to fetch
  let newLastVisible

  let noLimitQuery = query(collection(db, "shelves"), where("creatorId", "==", userId))
  const countSnap = await getCountFromServer(noLimitQuery)
  const totalNumOfShelves = countSnap.data().count

  // console.log("page", totalNumOfShelves, page)
  if (totalNumOfShelves > page * MAX_NUM_OF_SHELVES) newLastVisible = shelvesSnap.docs[shelvesSnap.docs.length - 1];
  else newLastVisible = "EOD"

  // console.log('last visible', newLastVisible)

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
    const notesData = await fetchNotes({ bookId, userId })
    // console.log("user book data", userBookSnap.data())
    return {
      status: bookData.status,
      rating: bookData.rating,
      shelves: bookData.shelves,
      notes: notesData
    }
  } else {
    return null
  }

}

export async function updateUserBookStatus({ bookId, userId, status }) {

  await setDoc(doc(db, "books", bookId, "users", userId), {
    status: status,
  }, { merge: true })

}

export async function updateUserBookRating({ bookId, userId, rating }) {

  await setDoc(doc(db, "books", bookId, "users", userId), {
    rating,
  }, { merge: true })

}


// NOTES

async function fetchNotes({ bookId, userId }) {
  const userBookNotesSnap = await getDocs(collection(db, "books", bookId, "users", userId, "notes"))
  // ADD ORDER BY CREATION DATE

  const userBookNotesData = []
  userBookNotesSnap.forEach((doc) => {
    userBookNotesData.push({ id: doc.id, data: doc.data() })
  })

  if (userBookNotesData.length == 0) {
    return null
  } else {
    return userBookNotesData
  }

}



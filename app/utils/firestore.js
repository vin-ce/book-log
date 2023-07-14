import { initializeApp } from "firebase/app";
import { getFirestore, collection, setDoc, doc, getDoc, getDocs, where, query } from "firebase/firestore";

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

export const createUser = async (userData) => {

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

export const fetchUser = async (userId) => {

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



const fetchBook = async (bookId) => {
  const bookSnap = await getDoc(doc(db, "books", bookId))
  if (bookSnap.exists()) {
    return bookSnap.data()
  } else {
    return null
  }
}

const fetchNotes = async ({ bookId, userId }) => {
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


const fetchCollectionsOfUserWithBook = async ({ bookId, userId }) => {

}

export const fetchUserBookInfo = async ({ bookId, userId }) => {

  const userBookSnap = await getDoc(doc(db, "books", bookId, "users", userId))
  if (userBookSnap.exists()) {
    const bookData = userBookSnap.data()
    const notesData = await fetchNotes({ bookId, userId })
    // console.log("user book data", userBookSnap.data())
    return {
      status: bookData.status,
      notes: notesData
    }
  } else {
    return null
  }

}





// bookId ->
// book is only created if user interacts with it through changing status or adding note or adding it to a collection



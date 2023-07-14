import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { createUser } from "./firestore";

const auth = getAuth();
const provider = new GoogleAuthProvider();


export async function initLogIn() {
  return await signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;

      const userData = {
        displayName: user.displayName,
        email: user.email,
        profileImageURL: user.photoURL,
        id: user.uid
      }

      createUser(userData)

      return true

    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      // const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);

      console.log("err", errorCode, errorMessage)

      return false
    });
}

export async function initLogOut() {
  return await signOut(auth).then(() => {
    // Sign-out successful.
    return true
  }).catch((error) => {
    // An error happened.
    const errorMessage = error.message;
    console.log("log out err", errorMessage)
    return false
  });
}

export function checkIsLoggedIn() { return auth.currentUser }

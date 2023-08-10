import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { checkIfEmailIsInvited, createUser, fetchUserById } from "./firestore";

const auth = getAuth();
const provider = new GoogleAuthProvider();

export async function initLogIn({ isRoomUser }) {
  return await signInWithPopup(auth, provider)
    .then(async (result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;

      const userData = {
        displayName: user.displayName,
        email: user.email,
        profileImageURL: user.photoURL,
        id: user.uid,
        isRoomUser: false,
      }

      // if not logging in from room
      // check if invited
      if (!isRoomUser) {
        const isInvited = await checkIfEmailIsInvited(user.email)
        if (!isInvited) {
          initLogOut()
          return false
        }
      }
      const foundUser = await fetchUserById(user.uid)
      if (foundUser) {

        return true

      } else {
        if (isRoomUser) userData.isRoomUser = true
        console.log("room user", userData)

        await createUser(userData)
        return true
      }


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

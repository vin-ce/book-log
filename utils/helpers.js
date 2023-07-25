import { useEffect } from "react";
import { useStore } from "./store";

export function formatDateFromDash(dateString) {
  const [day, month, year] = dateString.split('/');
  const dateObject = new Date(`${month}/${day}/${year}`);
  const formattedDate = dateObject.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return formattedDate;
};

export function formatDateFromSeconds(seconds) {
  const date = new Date(seconds * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

export function extractPartsFromDashDate(date) {
  const [day, month, year] = date.split('/');
  return { day, month, year };
}


export function ResetStates({ type }) {

  const setSelectedUserId = useStore((state) => state.setSelectedUserId)
  const setUserBookStatus = useStore((state) => state.setUserBookStatus)
  const setUserBookReadDate = useStore((state) => state.setUserBookReadDate)
  const setUserBookRating = useStore((state) => state.setUserBookRating)
  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)
  const setIsAuthorizedForSelectedUser = useStore(state => state.setIsAuthorizedForSelectedUser)
  const setUserBookNotes = useStore(state => state.setUserBookNotes)
  const setSelectedUserUsername = useStore((state) => state.setSelectedUserUsername)
  const setSelectedBookId = useStore((state) => state.setSelectedBookId)
  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const setSelectedShelfBookIds = useStore((state) => state.setSelectedShelfBookIds)

  useEffect(() => {
    // this is not reset in book view
    // because info is required for e.g 
    // redirecting from /bookId -> /bookId/username
    if (type === "full") {
      setSelectedUserUsername(null)
      setSelectedBookId(null)
    }

    setSelectedUserId(null)

    setIsAuthorizedForSelectedUser(false)

    setUserBookStatus(null)
    setUserBookReadDate(null)
    setUserBookRating(null)
    setUserBookShelfIdList(null)
    setUserBookNotes(null)

    setSelectedShelfInfo(null)
    setSelectedShelfBookIds(null)

  }, [setIsAuthorizedForSelectedUser, setSelectedBookId, setSelectedShelfBookIds, setSelectedShelfInfo, setSelectedUserId, setSelectedUserUsername, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus, type])


  // sets is authorized
  const loggedInUser = useStore((state) => state.loggedInUser)
  const selectedUserId = useStore((state) => state.selectedUserId)
  const isAuthorizedForSelectedUser = useStore((state) => state.isAuthorizedForSelectedUser)

  useEffect(() => {

    if (loggedInUser && selectedUserId && !isAuthorizedForSelectedUser)
      if (loggedInUser.id === selectedUserId)
        setIsAuthorizedForSelectedUser(true)

  }, [isAuthorizedForSelectedUser, loggedInUser, selectedUserId, setIsAuthorizedForSelectedUser])

  return (
    <></>
  )
}
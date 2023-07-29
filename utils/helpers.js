import { useEffect } from "react";
import { useStore } from "./store";


// ==========
// DATES

export function formatDateFromSlash(inputDate) {

  let dateParts

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(inputDate)) {
    const [yyyy, mm, dd] = inputDate.split('-');
    dateParts = [dd, mm, yyyy];
  } else {
    dateParts = inputDate.split('/');
  }


  if (dateParts.length === 3) {
    const [day, month, year] = dateParts;
    const formattedDate = new Date(`${month}/${day}/${year}`).toDateString();
    return formattedDate.split(' ').slice(1, 4).join(' ');
  } else if (dateParts.length === 2) {
    const [part1, part2] = dateParts;
    const month = part1
    const year = part2
    return `${getMonthName(month)} ${year}`
  } else if (dateParts.length === 1) {
    const year = dateParts[0];
    return year;
  } else {
    return 'Invalid date format';
  };

}

function getMonthName(month) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return monthNames[monthIndex] || 'Invalid month';
}

export function formatDateFromSeconds(seconds) {
  const date = new Date(seconds * 1000);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}


export function formatDatePartsToSlash(day, month, year) {
  if (day && month && year) {
    return `${day}/${month}/${year}`;
  } else if (!day && month && year) {
    return `${month}/${year}`;
  } else if (!day && !month && year) {
    return year.toString();
  } else {
    return "Invalid date format";
  }
}

export function extractPartsFromDashDate(dateString) {
  const dateParts = dateString.split('/');

  if (dateParts.length === 3) {
    const day = dateParts[0]
    const month = dateParts[1]
    const year = dateParts[2]
    return { day, month, year };

  } else if (dateParts.length === 2) {
    const month = dateParts[0]
    const year = dateParts[1]
    return { month, year };

  } else if (dateParts.length === 1) {
    const year = dateParts[0]
    return { year };
  }

  return null; // Invalid date format or parsing error
}

// ---

const isValidDay = (day, month, year) => {
  // Check if the day is a valid number and falls within 1 to 31 range
  const maxDaysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDaysInMonth) return false; // Invalid day

  return true
};

const isValidMonth = (month) => {
  // Check if the month is a valid number and falls within 1 to 12 range
  if (month < 1 || month > 12) return false; // Invalid month

  return true
};

const isValidYear = (year) => {
  // Check if the year is a valid number and falls within a reasonable range
  if (year < 1 || year > 2100) return false; // Invalid year
  return true
};

export const validateDate = (day, month, year) => {
  if (day && month && year) {

    if (!isValidYear(year)) {
      return false;
    }

    if (!isValidMonth(month)) {
      return false;
    }

    if (!isValidDay(day, month, year)) {
      return false;
    }
    return true; // Day, month, and year all exist

  } else if (!day && month && year) {

    if (!isValidYear(year)) {
      return false;
    }

    if (!isValidMonth(month)) {
      return false;
    }

    return true; // Month and year exist

  } else if (!day && !month && year) {

    if (!isValidYear(year)) {
      return false;
    }

    return true; // Only year exists

  } else {
    return false; // Invalid format
  }
};


// =========
// SORT

export function sortBooksByRating(arr) {

  let arrCopy = [...arr]
  arrCopy.sort(customSort);

  function customSort(a, b) {
    // Handle null values
    if (a.rating === null && b.rating === null) {
      return 0;
    } else if (!a.rating) {
      return 1;
    } else if (!b.rating) {
      return -1;
    }

    // Compare ratings normally for non-null values
    return b.rating - a.rating; // Sorting from highest to lowest
  }

  return arrCopy

}


// =========
// MISC
export function capitalizeFirstLetter(str) {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========
// RESET

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
  const setSelectedBookInfo = useStore((state) => state.setSelectedBookInfo)
  const setSelectedBookExists = useStore((state) => state.setSelectedBookExists)
  const setSelectedShelfInfo = useStore((state) => state.setSelectedShelfInfo)
  const setSelectedStatusForShelf = useStore((state) => state.setSelectedStatusForShelf)
  const setSelectedShelfBooksData = useStore((state) => state.setSelectedShelfBooksData)
  const setIsMaterialInfoModal = useStore((state) => state.setIsMaterialInfoModal)
  const setIsMaterial = useStore((state) => state.setIsMaterial)
  const setIsShelfInfoModal = useStore((state) => state.setIsShelfInfoModal)


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

    setSelectedBookInfo(null)
    setSelectedBookExists(null)

    setIsMaterial(false)

    setUserBookStatus(null)
    setUserBookReadDate(null)
    setUserBookRating(null)
    setUserBookShelfIdList(null)
    setUserBookNotes(null)

    setSelectedShelfInfo(null)
    setSelectedShelfBooksData(null)
    setSelectedStatusForShelf(null)

    setIsShelfInfoModal(false)
    setIsMaterialInfoModal(false)

  }, [setIsAuthorizedForSelectedUser, setIsMaterial, setIsMaterialInfoModal, setIsShelfInfoModal, setSelectedBookExists, setSelectedBookId, setSelectedBookInfo, setSelectedShelfBooksData, setSelectedShelfInfo, setSelectedStatusForShelf, setSelectedUserId, setSelectedUserUsername, setUserBookNotes, setUserBookRating, setUserBookReadDate, setUserBookShelfIdList, setUserBookStatus, type])


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
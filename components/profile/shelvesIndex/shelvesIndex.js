
import { fetchAllUserShelves } from "@/utils/firestore"
import { useStore } from "@/utils/store"

import styles from "./shelvesIndex.module.sass"
import { useEffect, useState } from "react"
import Link from "next/link"
import CreateShelfModal from "@/components/modals/createShelfModal/createShelfModal"

export default function ShelvesIndex() {
  const selectedUserId = useStore((state) => state.selectedUserId)
  const userAllShelves = useStore((state) => state.userAllShelves)
  const setUserAllShelves = useStore((state) => state.setUserAllShelves)

  const isCreateShelfModal = useStore((state) => state.isCreateShelfModal)
  const setIsCreateShelfModal = useStore((state) => state.setIsCreateShelfModal)

  const isAuthorizedForSelectedUser = useStore(state => state.isAuthorizedForSelectedUser)

  const [shelvesIndexData, setShelvesIndexData] = useState(null)
  // structure of data in shelvesIndexData 
  // [
  //   {
  //     character: "c",
  //     shelves: [
  //       {
  //         id: "",
  //         name: "cats", 
  //       },
  //     ] ,
  //     isMiddle: true,
  //   },
  // ]

  const [shelvesIndexEl, setShelvesIndexEl] = useState(null)

  // init data
  useEffect(() => {
    if (selectedUserId) initShelvesData()
    async function initShelvesData() {
      const shelvesData = await fetchAllUserShelves({ userId: selectedUserId })
      setUserAllShelves(shelvesData)
    }
  }, [selectedUserId, setUserAllShelves])

  // create organised index data
  useEffect(() => {
    if (userAllShelves) {
      const organisedShelvesData = groupObjectsByFirstCharacter(userAllShelves)
      setShelvesIndexData(organisedShelvesData)
    }
  }, [userAllShelves])

  // create element
  useEffect(() => {
    if (shelvesIndexData) {
      const el = createShelvesIndex(shelvesIndexData)
      setShelvesIndexEl(el)
    }
  }, [shelvesIndexData])

  return (
    <>
      <div className={styles.shelvesContainer}>
        <div className={styles.header}>
          <div className={styles.label}>shelves:</div>
          {
            isAuthorizedForSelectedUser ? <div className={styles.button} onClick={() => setIsCreateShelfModal(true)}>+ create shelf</div> : null
          }
        </div>
        <div className={styles.indexContainer}>
          {
            shelvesIndexEl ? shelvesIndexEl : `no shelves found`
          }
        </div>
      </div>
      {
        isCreateShelfModal ? <CreateShelfModal /> : null
      }
    </>
  )
}


function createShelvesIndexSection(section) {

  const shelvesArr = []
  section.shelves.forEach(shelf => {
    shelvesArr.push(
      <div key={`shelf_section_${section.character}_${shelf.id}`} className={styles.shelf}>
        <Link href={`/shelf/${shelf.id}`}>{shelf.name}</Link>
      </div>
    )
  })

  return (
    <div key={`shelf_section_${section.character}`} className={styles.shelfSection}>
      <div className={styles.character}>{section.character}</div>
      <div className={styles.shelfNamesContainer}>
        {shelvesArr}
      </div>
    </div>
  )
}

function createShelvesIndex(array) {

  let hasPastMiddle
  let leftCol = []
  let rightCol = []

  array.forEach((section) => {
    const sectionEl = createShelvesIndexSection(section)
    if (!hasPastMiddle) leftCol.push(sectionEl)
    else rightCol.push(sectionEl)

    if (section.isMiddle) hasPastMiddle = true
  })

  return (
    <>
      <div className={styles.leftCol}>{leftCol}</div>
      <div className={styles.rightCol}>{rightCol}</div>
    </>
  )

}


const groupObjectsByFirstCharacter = (arr) => {

  const sortedArray = sortSpecialCharacterToTop(arr)

  const characterSets = []
  const middleIndex = Math.floor(arr.length / 2) - 1

  sortedArray.forEach((obj, index) => {
    // gets first character
    const firstChar = Array.from(obj.name)[0].toLowerCase();
    // is this character already in the set
    const indexOfCharObj = characterSets.findIndex((item) => item.character === firstChar);

    // if yes push the shelf in
    if (indexOfCharObj !== -1) characterSets[indexOfCharObj].shelves.push(obj)
    else {
      // if no create it
      characterSets.push(
        {
          character: firstChar,
          shelves: [obj]
        }
      )
    }

    if (middleIndex === index) {
      const indexOfCharObj = characterSets.findIndex((item) => item.character === firstChar);
      characterSets[indexOfCharObj].isMiddle = true
    }
  });

  return characterSets

};

function sortSpecialCharacterToTop(array) {
  const dataArray = [...array]

  const specialCharRegex = /^[^a-z0-9]/i;

  dataArray.sort((a, b) => {
    const isSpecialA = specialCharRegex.test(a.name);
    const isSpecialB = specialCharRegex.test(b.name);

    if (isSpecialA !== isSpecialB) {
      // Sort objects with special characters to the top
      return isSpecialA ? -1 : 1;
    } else {
      // Preserve original alphabetical order
      return a.name.localeCompare(b.name);
    }
  });
  return dataArray
}

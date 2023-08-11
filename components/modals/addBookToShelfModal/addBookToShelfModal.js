
import { useStore } from "@/utils/store"
import styles from "./addBookToShelfModal.module.sass"
import { useEffect, useState, useRef } from "react"
import { addBookToShelf, createShelf, fetchShelvesPaginated, removeBookFromShelf } from "@/utils/firestore"
import { StandardModal } from "../modalTemplates"
import { useFreshRef } from "@/hooks/useFreshRef"

export default function AddBookToShelfModal() {

  // store states and funcs
  const setIsAddBookToShelfModal = useStore((state) => state.setIsAddBookToShelfModal)
  const selectedUserId = useStore((state) => state.selectedUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookShelfIdList = useStore((state) => state.userBookShelfIdList)
  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  const [userBookIdListFresh, setUserBookIdListFresh] = useFreshRef(userBookShelfIdList, setUserBookShelfIdList)


  // hard capped to 5 results, actively displayed list of shelves
  const [shelfListElArr, setShelfListElArrDisplay] = useState([])
  const MAX_SHELF_LIST_NUM = 5

  // shelf list, all fetched shelf elements
  const shelfListAllData = useRef([
    // {
    //  // id: shelfId,
    //  // name: shelfName,
    //  // el: shelfEl,
    // }
  ])

  // pagination
  const paginationData = useRef({ lastVisible: null, page: 1, totalNumOfShelves: null })


  // inputs
  const [isCreateShelfInput, setIsCreateShelfInput] = useState(null)
  const [createShelfInput, setCreateShelfInput] = useState('')

  const handleCreateShelfChange = e => {
    e.preventDefault()

    if (e.target.value.length > 50) return

    let inputString = e.target.value

    // Step 1: Replace two or more spaces with a single space
    const regexStep1 = /\s{2,}/g;
    const result = inputString.replace(regexStep1, " ");

    setCreateShelfInput(result)
  }



  // shelf list

  function createShelfItemEl({ shelfName, shelfId }) {

    let buttonClass = styles.button
    // it's in the id list i.e already added
    if (userBookIdListFresh.current)
      if (userBookIdListFresh.current.indexOf(shelfId) !== -1) buttonClass = styles.postAddButton

    return (
      <div key={shelfId} className={styles.shelfItem}>
        <div className={styles.shelfName}>{shelfName}</div>
        <div className={styles.buttonContainer}>
          <span className={buttonClass} data-shelf-id={shelfId} onClick={handleToggleBookToShelf}>+</span>
        </div>
      </div>
    )
  }

  async function setShelfList({ type }) {
    let shelvesData
    let newLastVisible
    let totalNumOfShelves

    if (type === "init") {
      ({ shelvesData, newLastVisible, totalNumOfShelves } = await fetchShelvesPaginated({ userId: selectedUserId, page: paginationData.current.page }))

      updateShelfListElAndData({ type })

    } else {

      let selectRangeStart = (paginationData.current.page - 1) * MAX_SHELF_LIST_NUM
      let selectRangeEnd = paginationData.current.page * MAX_SHELF_LIST_NUM

      if (type === "prev") {
        // get el database, gets from index selectRangeStart until index selectRangeEnd minus 1
        const listArr = extractElsFromArr(shelfListAllData.current.slice(selectRangeStart, selectRangeEnd))
        setShelfListElArrDisplay(listArr)
      }

      if (type === 'next') {
        // if list does not contain the full range
        if (shelfListAllData.current.length < paginationData.current.totalNumOfShelves) {
          ({ shelvesData, newLastVisible, totalNumOfShelves } = await fetchShelvesPaginated({ userId: selectedUserId, lastVisible: paginationData.current.lastVisible, page: paginationData.current.page }))

          updateShelfListElAndData({ type })

        } else {
          const listArr = extractElsFromArr(shelfListAllData.current.slice(selectRangeStart, selectRangeEnd))
          setShelfListElArrDisplay(listArr)
        }
      }
    }

    function updateShelfListElAndData({ type }) {

      let shelvesElArr = []
      let shelvesListArr = []

      shelvesData.forEach(shelfData => {
        const shelfEl = createShelfItemEl({
          shelfId: shelfData.id,
          shelfName: shelfData.name,
        })

        shelvesElArr.push(shelfEl)
        shelvesListArr.push({
          id: shelfData.id,
          name: shelfData.name,
          el: shelfEl,
        })
      })

      // remove old data so it doesn't duplicate
      if (type === "next" && shelfListElArr.length != 5) shelfListAllData.current.splice(-shelvesElArr.length)

      setShelfListElArrDisplay(shelvesElArr)
      shelfListAllData.current = ([...shelfListAllData.current, ...shelvesListArr])

      if (newLastVisible !== "EOD") paginationData.current.lastVisible = newLastVisible

      paginationData.current.totalNumOfShelves = totalNumOfShelves
    }

  }


  // initial shelf list
  useEffect(() => {
    if (selectedUserId) setShelfList({ type: "init" })
  }, [selectedUserId])



  // shelf

  const toggleCreateShelf = (bool) => {
    setCreateShelfInput('')
    setIsCreateShelfInput(bool)
  }

  const handleCreateShelf = async (e) => {
    if (createShelfInput.trimStart() == "") return
    if (createShelfInput.length > 50) return


    let shelfName = createShelfInput
    // trim white space off start and end
    shelfName.trimStart()
    shelfName.trimEnd()
    // shelfName = DOMPurify.sanitize(shelfName);

    // create shelf on firebase
    const shelfId = await createShelf({ shelfData: { name: shelfName }, userId: selectedUserId, bookId: selectedBookId })

    // update in app state
    if (userBookIdListFresh.current) setUserBookIdListFresh([shelfId, ...userBookIdListFresh.current])
    else setUserBookIdListFresh([shelfId])

    // removes last element in modal UI if overflow
    let shelfListElArrCopy = shelfListElArr

    if (shelfListElArrCopy.length >= MAX_SHELF_LIST_NUM) {
      shelfListElArrCopy.pop()
    }

    // add shelf to elements UI
    let shelfItem = createShelfItemEl({ shelfName, shelfId })

    setShelfListElArrDisplay([shelfItem, ...shelfListElArrCopy])
    shelfListAllData.current = ([{ id: shelfId, el: shelfItem, name: shelfName }, ...shelfListAllData.current])

    paginationData.current.totalNumOfShelves++

    // turn off add shelf UI
    toggleCreateShelf(false)
  }

  // changes whether or not the book is on the shelf
  function handleToggleBookToShelf(e) {

    const el = e.target
    const shelfId = el.dataset.shelfId

    // classname keeps track of if the shelf has been added to or not
    if (el.classList.contains(styles.button)) {
      // add book
      el.classList.remove(styles.button)
      el.classList.add(styles.postAddButton)
      addBookToShelf({ bookId: selectedBookId, shelfId: shelfId, userId: selectedUserId })

      // add shelf to book list state
      if (userBookIdListFresh.current)
        setUserBookIdListFresh([shelfId, ...userBookIdListFresh.current])
      else
        setUserBookIdListFresh([shelfId])


    } else {
      // remove book
      el.classList.remove(styles.postAddButton)
      el.classList.add(styles.button)
      removeBookFromShelf({ bookId: selectedBookId, shelfId: shelfId, userId: selectedUserId })

      // removes shelf from book list state
      const indexToRemove = userBookIdListFresh.current.indexOf(shelfId);
      if (indexToRemove !== -1) userBookIdListFresh.current.splice(indexToRemove, 1);
      setUserBookIdListFresh([...userBookIdListFresh.current])
    }

    // update element in full state so classname / element state change is retained when switching pages

    const toUpdateElObj = shelfListAllData.current.find(elData => elData.id === shelfId)
    const toUpdateElObjIndex = shelfListAllData.current.indexOf(toUpdateElObj)

    const newEl = createShelfItemEl({ shelfName: toUpdateElObj.name, shelfId: toUpdateElObj.id })

    shelfListAllData.current[toUpdateElObjIndex].el = newEl
  }


  return (
    <StandardModal
      title={"Add Book To Shelf"}
      setIsModelOpen={setIsAddBookToShelfModal}
      headerButtons={<span className={styles.button} onClick={() => toggleCreateShelf(true)}>+</span>}
    >
      {isCreateShelfInput ?
        (
          <div className={styles.createShelfContainer}>
            <input type="text" placeholder="Create shelf..." onChange={handleCreateShelfChange} value={createShelfInput} className={styles.input} />
            <div className={styles.buttonContainer}>
              <span className={styles.button} onClick={handleCreateShelf}>+</span>
            </div>
          </div>
        )
        :
        null
      }

      <div className={styles.shelfList}>
        {shelfListElArr.length > 0
          ?
          (shelfListElArr)
          :
          (<div className={styles.shelvesPlaceholder}>No shelves found</div>)
        }
      </div>
      {
        (paginationData.current.page > 1 || (paginationData.current.totalNumOfShelves > 5)) ? <PaginationControls paginationData={paginationData} setShelfList={setShelfList} /> : null
      }
    </StandardModal>
  )
}

// ===============
// PAGINATION

function PaginationControls({ paginationData, setShelfList }) {

  const nextPage = async () => {
    paginationData.current.page++
    setShelfList({ type: "next" })
  }

  const prevPage = async () => {
    paginationData.current.page--
    setShelfList({ type: "prev" })
  }

  if (paginationData.current.page > 1 && (paginationData.current.totalNumOfShelves <= paginationData.current.page * 5)) {
    return (
      <div className={styles.paginationControls}>
        <span className={styles.button} onClick={prevPage}>&lt;</span>
        <span className={styles.pageNum}>{paginationData.current.page}</span>
        <span className={[styles.hidden, styles.button].join(' ')}>&gt;</span>
      </div>
    )
  }
  else if (paginationData.current.page > 1) {
    return (
      <div className={styles.paginationControls}>
        <span className={styles.button} onClick={prevPage}>&lt;</span>
        <span className={styles.pageNum}>{paginationData.current.page}</span>
        <span className={styles.button} onClick={nextPage}>&gt;</span>
      </div>
    )
  }
  else {
    return (
      <div className={styles.paginationControls}>
        <span className={[styles.hidden, styles.button].join(' ')}>&lt;</span>
        <span className={styles.pageNum}>{paginationData.current.page}</span>
        <span className={styles.button} onClick={nextPage}>&gt;</span>
      </div>
    )
  }

}


function extractElsFromArr(shelfList) {

  const elArr = []
  shelfList.forEach(shelf => {
    elArr.push(shelf.el)
  })

  return elArr

}
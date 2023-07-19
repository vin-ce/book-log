
import { useStore } from "@/utils/store"
import styles from "./addBookToShelfModal.module.sass"
import { useEffect, useState, useRef } from "react"
import { addBookToShelf, createShelf, fetchShelves, removeBookFromShelf } from "@/utils/firestore"


export default function AddBookToShelfModal() {

  // store states and funcs
  const setIsAddBookToShelfModal = useStore((state) => state.setIsAddBookToShelfModal)
  const selectedBookUserId = useStore((state) => state.selectedBookUserId)
  const selectedBookId = useStore((state) => state.selectedBookId)

  const userBookShelfIdList = useStore((state) => state.userBookShelfIdList)
  const setUserBookShelfIdList = useStore((state) => state.setUserBookShelfIdList)

  // shelf list
  // hard capped to 5 results
  const [shelfListElArr, setShelfListElArr] = useState([])
  const MAX_SHELF_LIST_NUM = 5


  // inputs
  const [isCreateShelfInput, setIsCreateShelfInput] = useState(null)
  const [createShelfInput, setCreateShelfInput] = useState('')

  const handleCreateShelfChange = e => {
    e.preventDefault()
    if (createShelfInput.length > 50) return

    let inputString = e.target.value

    // Step 1: Replace two or more spaces with a single space
    const regexStep1 = /\s{2,}/g;
    const step1Result = inputString.replace(regexStep1, " ");

    // Step 2: Remove anything that is not alphanumeric
    const regexStep2 = /[^a-zA-Z0-9\s]/g;
    const result = step1Result.replace(regexStep2, "");

    setCreateShelfInput(result)
  }

  // modal

  const closeModal = (e) => {
    // reset all values
    setIsAddBookToShelfModal(false)
  }

  const handleBackgroundClick = (e) => {
    closeModal()
  }

  const handleModalClick = (e) => {
    e.stopPropagation()
  }


  // pagination
  const [paginationControls, setPaginationControls] = useState(null)
  const paginationData = useRef({ lastVisible: null, page: 1 })

  useEffect(() => {
    if ((shelfListElArr && paginationData.current.lastVisible) || paginationData.current.page > 1) setPaginationControls(createPaginationControls({ paginationData: paginationData.current }))

    else setPaginationControls(null)

  }, [shelfListElArr])

  function createPaginationControls({ paginationData }) {

    const nextPage = async () => {
      paginationData.page++
      setShelfList(paginationData.lastVisible)
    }

    const prevPage = async () => {
      paginationData.page--
      setShelfList(paginationData.lastVisible)
    }

    if (paginationData.page > 1 && paginationData.lastVisible) {
      return (
        <div className={styles.paginationControls}>
          <span className={styles.button} onClick={prevPage}>&lt;</span>
          <span className={styles.pageNum}>{paginationData.page}</span>
          <span className={styles.button} onClick={nextPage}>&gt;</span>
        </div>
      )
    } else if (paginationData.page > 1 && !paginationData.lastVisible) {
      return (
        <div className={styles.paginationControls}>
          <span className={styles.button} onClick={prevPage}>&lt;</span>
          <span className={styles.pageNum}>{paginationData.page}</span>
          <span className={[styles.hidden, styles.button].join(' ')}>&gt;</span>
        </div>
      )
    }

    else {
      return (
        <div className={styles.paginationControls}>
          <span className={[styles.hidden, styles.button].join(' ')}>&lt;</span>
          <span className={styles.pageNum}>{paginationData.page}</span>
          <span className={styles.button} onClick={nextPage}>&gt;</span>
        </div>
      )
    }

  }

  // shelf list


  function createShelfItemEl({ shelfName, shelfId, hasAdded }) {

    let buttonClass = styles.button
    // if it's just added or it's in the id list i.e already added
    if (hasAdded || userBookShelfIdList.indexOf(shelfId) !== -1) buttonClass = styles.postAddButton

    return (
      <div key={shelfId} className={styles.shelfItem}>
        <div className={styles.shelfName}>{shelfName}</div>
        <div className={styles.buttonContainer}>
          <span className={buttonClass} data-shelf-id={shelfId} onClick={handleToggleBookToShelf}>+</span>
        </div>
      </div>
    )
  }

  async function setShelfList(lastVisible) {
    let shelvesData
    let newLastVisible

    if (lastVisible) ({ shelvesData, newLastVisible } = await fetchShelves({ userId: selectedBookUserId, lastVisible }))
    else ({ shelvesData, newLastVisible } = await fetchShelves({ userId: selectedBookUserId }))

    let shelvesElArr = []
    shelvesData.forEach(shelfData => {
      const shelfEl = createShelfItemEl({
        shelfId: shelfData.id,
        shelfName: shelfData.name,
      })
      shelvesElArr.push(shelfEl)
    })

    setShelfListElArr(shelvesElArr)

    console.log("new last visible", newLastVisible)
    paginationData.current.lastVisible = newLastVisible
  }

  // initial shelf list
  useEffect(() => {
    if (selectedBookUserId) setShelfList()
  }, [selectedBookUserId])



  // shelf

  const toggleCreateShelf = (bool) => {
    setCreateShelfInput('')
    setIsCreateShelfInput(bool)
  }

  const handleCreateShelf = async (e) => {
    if (createShelfInput.trimStart() == "") return
    if (createShelfInput.length > 50) return

    // trim white space off start and end
    createShelfInput.trimStart()
    createShelfInput.trimEnd()

    const shelfName = createShelfInput
    // create shelf on firebase
    const shelfId = await createShelf({ shelfName, userId: selectedBookUserId, bookId: selectedBookId })

    // update in app state
    setUserBookShelfIdList([shelfId, ...userBookShelfIdList])

    // removes last element if overflow
    let shelfListElArrCopy = shelfListElArr

    if (shelfListElArrCopy.length >= MAX_SHELF_LIST_NUM) {
      shelfListElArrCopy.pop()
    }

    // add shelf to global state
    let shelfItem = createShelfItemEl({ shelfName, shelfId, hasAdded: true })
    setShelfListElArr([shelfItem, ...shelfListElArrCopy])

    // turn off add shelf UI
    toggleCreateShelf(false)
  }

  function handleToggleBookToShelf(e) {

    const el = e.target
    const shelfId = el.dataset.shelfId

    if (el.classList.contains(styles.button)) {
      // add book
      el.classList.remove(styles.button)
      el.classList.add(styles.postAddButton)
      addBookToShelf({ bookId: selectedBookId, shelfId: shelfId, userId: selectedBookUserId })

      // add shelf to book list state
      setUserBookShelfIdList([shelfId, ...userBookShelfIdList])

    } else {
      // remove book
      el.classList.remove(styles.postAddButton)
      el.classList.add(styles.button)
      removeBookFromShelf({ bookId: selectedBookId, shelfId: shelfId, userId: selectedBookUserId })

      // removes shelf from book list state
      const userBookShelfIdListCopy = [...userBookShelfIdList]
      const indexToRemove = userBookShelfIdListCopy.indexOf(shelfId);
      if (indexToRemove !== -1) userBookShelfIdListCopy.splice(indexToRemove, 1);
      setUserBookShelfIdList(userBookShelfIdListCopy)
    }
  }


  return (
    <div className={styles.container} onClick={handleBackgroundClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <span className={styles.title}>Add Book To Shelf</span>
          <div className={styles.headerButtons}>
            <span className={styles.button} onClick={() => toggleCreateShelf(true)}>+</span>
            <span className={styles.button} onClick={closeModal}>x</span>
          </div>
        </div>
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
          null}

        {/*  */}
        <div className={styles.shelfList}>
          {shelfListElArr.length > 0 ?
            (
              shelfListElArr
            )
            :
            (
              <div className={styles.shelvesPlaceholder}>No shelves found</div>
            )}
        </div>
        {paginationControls}
      </div>
    </div>
  )
}


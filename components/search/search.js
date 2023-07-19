import { useState, useRef, useEffect } from "react"
import BooksDisplay from "../booksDisplay"
import styles from "./search.module.sass"
import { searchBookByText } from "../../utils/bookAPI"
import { useStore } from "@/utils/store"



const MAX_RESULTS = 10

export default function Search() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResultData, setSearchResultData] = useState(null)
  const [paginationControls, setPaginationControls] = useState(null)
  const searchStringRef = useRef(null)
  const paginationData = useRef({ startIndex: 0, page: 1 })

  const panelRef = useRef(null)

  const handleChange = e => {
    e.preventDefault()
    setSearchInput(e.target.value)
  }

  // updates pagination controls on data change
  useEffect(() => {
    if (searchResultData || paginationData.current.page !== 1) setPaginationControls(createPaginationControls({ paginationData: paginationData.current, setSearchResultData, searchString: searchStringRef, panelRef }))

    else setPaginationControls(null)

  }, [searchResultData])


  // for initial search
  const initSearch = async () => {
    if (searchInput.trimStart() == "") return

    // reset pagination
    searchStringRef.current = searchInput

    const resultsData = await searchBookByText({ searchInput, startIndex: 0, maxResults: MAX_RESULTS })

    paginationData.current.startIndex = 0
    paginationData.current.page = 1

    setSearchResultData(resultsData)
  }

  const handleOnKeyUp = (e) => {
    if (e.keyCode === 13) initSearch()
  }



  return (
    <div className={styles.panelContainer} ref={panelRef}>
      <div className={styles.searchBox}>
        <input type="text" placeholder="Search for books..." onChange={handleChange} value={searchInput} className={styles.input} onKeyUp={handleOnKeyUp} />
        <div className={styles.button} onClick={initSearch}>-&gt;</div>
      </div>
      <BooksDisplay data={searchResultData} />
      {paginationControls}
    </div>
  )
}

function createPaginationControls({ paginationData, setSearchResultData, searchString, panelRef }) {


  const nextPage = async () => {
    paginationData.page++
    paginationData.startIndex += MAX_RESULTS

    const resultsData = await searchBookByText({ searchString, startIndex: paginationData.startIndex, maxResults: MAX_RESULTS })

    setSearchResultData(resultsData)

    // panelRef.current.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    panelRef.current.scrollTo({ top: 0, left: 0 })
  }

  const prevPage = async () => {
    paginationData.page--
    paginationData.startIndex -= MAX_RESULTS

    const resultsData = await searchBookByText({ searchString, startIndex: paginationData.startIndex, maxResults: MAX_RESULTS })

    setSearchResultData(resultsData)
  }

  if (paginationData.page > 1) {
    return (
      <div className={styles.paginationControls}>
        <span onClick={prevPage}>&lt;</span> {paginationData.page} <span onClick={nextPage}>&gt;</span>
      </div>
    )
  } else {
    return (
      <div className={styles.paginationControls}>
        {paginationData.page} <span onClick={nextPage}>&gt;</span>
      </div>
    )
  }

}
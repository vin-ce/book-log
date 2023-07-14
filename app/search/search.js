'use client'

import { useState } from "react"
import BooksDisplay from "../components/booksDisplay"
import styles from "./search.module.sass"
import { searchBookByText } from "../utils/bookAPI"

export default function Search() {
  const [searchInput, setSearchInput] = useState('')
  const [searchResultData, setSearchResultData] = useState(null)

  const handleChange = e => {
    e.preventDefault()
    setSearchInput(e.target.value)
  }

  const initSearch = async () => {
    if (searchInput.trimStart() == "") return
    setSearchInput('')
    const data = await searchBookByText(searchInput)
    setSearchResultData(data)
  }

  const handleOnKeyUp = (e) => {
    if (e.keyCode === 13) initSearch()
  }

  return (
    <div className={styles.panelContainer}>
      <div className={styles.searchBox}>
        <input type="text" placeholder="Search for books..." onChange={handleChange} value={searchInput} className={styles.input} onKeyUp={handleOnKeyUp} />
        <div className={styles.button} onClick={initSearch}>&#91;-&gt;&#93;</div>
      </div>
      <div>
        <BooksDisplay data={searchResultData} />
      </div>
    </div>
  )
}
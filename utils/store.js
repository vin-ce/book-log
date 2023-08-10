import { create } from "zustand"

export const useStore = create((set) => ({

  // LOGGED IN USER
  loggedInUser: null,
  setLoggedInUser: (userData) => set({ loggedInUser: userData }),
  setLoggedOut: () => set({ loggedInUser: null }),

  finishInitialAuthCheck: false,
  setFinishInitialAuthCheck: (bool) => set({ loggedInUser: bool }),

  // SELECTED USER

  selectedUserUsername: null,
  setSelectedUserUsername: (username) => set({ selectedUserUsername: username }),

  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),

  isAuthorizedForSelectedUser: false,
  setIsAuthorizedForSelectedUser: (bool) => set({ isAuthorizedForSelectedUser: bool }),

  isUserSettingsModal: null,
  setIsUserSettingsModal: (bool) => set({ isUserSettingsModal: bool }),

  // SEARCH DATA

  // {
  //   searchResults: []
  //   searchString: ""
  //   startIndex: 
  //   page: 
  // }
  searchData: null,
  setSearchResultData: (data) => set({ searchData: data }),

  // SELECTED BOOK 
  selectedBookId: null,
  setSelectedBookId: (id) => set({ selectedBookId: id }),

  selectedBookExists: null,
  setSelectedBookExists: (bool) => set({ selectedBookExists: bool }),

  selectedBookInfo: null,
  setSelectedBookInfo: (data) => set({ selectedBookInfo: data }),

  // MATERIAL

  isMaterialInfoModal: false,
  setIsMaterialInfoModal: (bool) => set({ isMaterialInfoModal: bool }),

  // USER BOOK

  userBookStatus: null,
  setUserBookStatus: (status) => set({ userBookStatus: status }),

  userBookReadDate: null,
  setUserBookReadDate: (date) => set({ userBookReadDate: date }),

  userBookRating: null,
  setUserBookRating: (status) => set({ userBookRating: status }),

  // shelves that the selectedBook is in that's created by the user
  userBookShelfIdList: null,
  setUserBookShelfIdList: (arr) => set({ userBookShelfIdList: arr }),

  userBookNotes: null,
  setUserBookNotes: (arr) => set({ userBookNotes: arr }),

  // USER BOOK MODALS

  isAddBookToShelfModal: false,
  setIsAddBookToShelfModal: (bool) => set({ isAddBookToShelfModal: bool }),

  isSetBookRatingModal: false,
  setIsSetBookRatingModal: (bool) => set({ isSetBookRatingModal: bool }),

  isSetBookReadDateModal: false,
  setIsSetBookReadDateModal: (bool) => set({ isSetBookReadDateModal: bool }),

  isCreateTweetNoteModal: false,
  setIsCreateTweetNoteModal: (bool) => set({ isCreateTweetNoteModal: bool }),
  isCreateTextNoteModal: false,
  setIsCreateTextNoteModal: (bool) => set({ isCreateTextNoteModal: bool }),

  // SHELF

  userAllShelves: null,
  setUserAllShelves: (data) => set({ userAllShelves: data }),

  isShelfInfoModal: false,
  setIsShelfInfoModal: (bool) => set({ isShelfInfoModal: bool }),

  selectedShelfInfo: null,
  setSelectedShelfInfo: (data) => set({ selectedShelfInfo: data }),

  selectedShelfBooksData: null,
  setSelectedShelfBooksData: (books) => set({ selectedShelfBooksData: books }),


  selectedStatusForShelf: null,
  setSelectedStatusForShelf: (status) => set({ selectedStatusForShelf: status }),


  // ROOM

  selectedRoomInfo: null,
  setSelectedRoomInfo: (data) => set({ selectedRoomInfo: data }),

  selectedRoomNotes: null,
  setSelectedRoomNotes: (notes) => set({ selectedRoomNotes: notes }),

  isRoomAdmin: false,
  setIsRoomAdmin: (bool) => set({ isRoomAdmin: bool }),

  activeLiveCursorUserId: null,
  setActiveLiveCursorUserId: (id) => set({ activeLiveCursorUserId: id }),

  // isCreateRoomTextNoteModal: false,
  // setIsCreateRoomTextNoteModal: (bool) => set({ isCreateRoomTextNoteModal: bool }),

}))

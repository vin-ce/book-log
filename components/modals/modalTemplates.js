
import styles from "./modalTemplates.module.sass"


export function StandardModal({ title, setIsModelOpen, headerButtons, modalClass, children }) {

  const closeModal = (e) => setIsModelOpen(false)
  const handleWrapperClick = (e) => closeModal()
  const handleModalClick = (e) => e.stopPropagation()

  return (
    <div className={styles.wrapper} onMouseDown={handleWrapperClick}>
      <div className={[styles.modal, modalClass].join(' ')} onMouseDown={handleModalClick}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <div className={styles.headerButtons}>
            {headerButtons}
            <span className={styles.button} onClick={closeModal}>x</span>
          </div>
        </div>

        {children}

      </div>
    </div>
  )
}


export function DeleteModal({ title, setIsModelOpen, onClickYes }) {

  const closeModal = (e) => setIsModelOpen(false)
  const handleWrapperClick = (e) => closeModal()
  const handleModalClick = (e) => e.stopPropagation()

  return (
    <div className={styles.wrapper} onMouseDown={handleWrapperClick}>
      <div className={styles.modal} onMouseDown={handleModalClick}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <div className={styles.headerButtons}>
            <span className={styles.button} onClick={closeModal}>x</span>
          </div>
        </div>

        <div className={styles.options}>
          <div className={styles.yes} onClick={onClickYes}>yes</div>
          <div className={styles.cancel} onClick={closeModal}>cancel</div>
        </div>

      </div>
    </div>
  )
}
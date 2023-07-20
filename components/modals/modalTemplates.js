
import styles from "./modalTemplate.module.sass"


export function StandardModal({ title, setIsModelOpen, children }) {

  const closeModal = (e) => setIsModelOpen(false)
  const handleWrapperClick = (e) => closeModal()
  const handleModalClick = (e) => e.stopPropagation()

  return (
    <div className={styles.wrapper} onClick={handleWrapperClick}>
      <div className={styles.modal} onClick={handleModalClick}>
        <div className={styles.header}>
          <span className={styles.title}>{title}</span>
          <span className={styles.button} onClick={closeModal}>x</span>
        </div>

        {children}

      </div>
    </div>
  )
}
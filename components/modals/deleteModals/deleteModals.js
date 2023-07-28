
import { useStore } from "@/utils/store";
import { StandardModal } from "../modalTemplates";
import styles from "./deleteModals.module.sass"
import { deleteNote, deleteShelf, removeBookFromShelf } from "@/utils/firestore"
import { useRouter } from "next/router";



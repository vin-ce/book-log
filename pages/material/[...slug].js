import { useStore } from "@/utils/store";
import Book from "../book/[...slug]";

export default function Material() {

  const isMaterial = useStore((state) => state.isMaterial)
  const setIsMaterial = useStore((state) => state.setIsMaterial)
  if (!isMaterial) setIsMaterial(true)

  return <Book />
}
import { useStore } from "@/utils/store";
import Book from "../book/[...slug]";
import { ResetStates } from "@/utils/helpers";
import { useEffect } from "react";

export default function Material() {

  return (
    <>
      <Book isMaterial={true} />
      <ResetStates />
    </>
  )
}
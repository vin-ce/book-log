import { useRef } from "react";

// https://css-tricks.com/dealing-with-stale-props-and-states-in-reacts-functional-components/

export function useFreshRef(value, setOriginalState) {
  const ref = useRef(value);

  function updateState(newState) {
    ref.current = newState;
    setOriginalState(newState)
  }

  return [ref, updateState];
}
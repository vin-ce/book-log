import { useRef, useState } from "react";

// https://css-tricks.com/dealing-with-stale-props-and-states-in-reacts-functional-components/

export function useFreshRef(value, setOriginalState) {
  const ref = useRef(value);
  const [, forceRender] = useState(false);

  function updateState(newState) {
    ref.current = newState;
    if (setOriginalState) setOriginalState(newState)
    else forceRender(s => !s)
  }

  return [ref, updateState];
}
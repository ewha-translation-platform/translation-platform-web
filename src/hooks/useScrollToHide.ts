import { useEffect, useState } from "react";

function useScrollToHide(delta: number = 0) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const curScroll = window.scrollY;
      if (curScroll <= delta) {
        setHidden(false);
      } else {
        if (curScroll > lastScroll) {
          setHidden(true);
        } else if (curScroll < lastScroll) {
          setHidden(false);
        }
      }
      lastScroll = curScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [delta]);
  return hidden;
}

export default useScrollToHide;

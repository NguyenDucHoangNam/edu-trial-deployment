"use client";

import { useEffect } from "react";

export default function ScrollUp() {
  useEffect(() => window.document.scrollingElement?.scrollTo(0, 0), []);

  return null;
}

//Khi component này được gắn (mount) vào cây DOM (tức là khi nó được render lần đầu tiên trong một trang hoặc 
// một phần của trang), nó sẽ tự động cuộn trang web lên vị trí cao nhất (đầu trang).
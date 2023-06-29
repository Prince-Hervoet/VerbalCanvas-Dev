import React from "react";
import { useBudge } from "../budge/budge";

export default function Bb() {
  const store = useBudge("test");
  const change = () => {
    store.isLoading = true;
    setTimeout(() => {
      store.isLoading = false;
    }, 1200);
  };
  return (
    <div
      style={{ width: 100, height: 100, backgroundColor: "blue" }}
      onClick={change}
    ></div>
  );
}

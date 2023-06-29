import React from "react";
import { createBudgeStore, useBudge, budge } from "../budge/budge";

createBudgeStore("test", {
  count: 112,
  size: 3434,
  isLoading: false,
  action: function () {
    this.count += 5;
  },
});

function Target() {
  const { count, isLoading } = useBudge("test");
  return (
    <div>
      {isLoading ? (
        <div style={{ width: 200, height: 200, backgroundColor: "red" }}></div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default budge(Target);

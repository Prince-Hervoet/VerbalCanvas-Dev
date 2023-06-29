import React from "react";

// 当前正在追踪的组件
let currentTrack = null;
// key映射到store
const keyToBudgeStore = new Map();

// 用于包装普通组件，转成一个响应式组件
export function budge(Target) {
  return class Hoc extends React.Component {
    track = null;
    constructor(props) {
      super(props);
      this.state = {};
      const autoRun = () => {
        this.setState({});
      };
      currentTrack = {
        autoRun,
        deps: {},
      };
      this.track = currentTrack;
    }

    componentDidMount() {
      // 收集完成
      currentTrack = null;
    }

    componentWillUnmount() {
      // 释放工作
      const deps = this.track.deps;
      for (const storeName in deps) {
        const { reaction } = keyToBudgeStore.get(storeName);
        reaction.watchers.delete(this.track);
      }
      this.track = null;
      console.log("unmount");
    }

    render() {
      return (
        <>
          <Target></Target>
        </>
      );
    }
  };
}

// 通过name获取store
export function useBudge(storeName) {
  return keyToBudgeStore.get(storeName)?.reactionProxy;
}

export function createBudgeStore(storeName, target) {
  if (!storeName || !target) {
    return;
  }

  const reaction = { ...target };
  const reactionProxy = {};

  for (const key in reaction) {
    Object.defineProperty(reactionProxy, key, {
      get() {
        if (currentTrack) {
          if (!reaction.watchers.has(key)) {
            reaction.watchers.set(key, new Set());
          }
          reaction.watchers.get(key).add(currentTrack);

          if (!currentTrack.deps.hasOwnProperty(storeName)) {
            currentTrack.deps[storeName] = [];
          }

          currentTrack.deps[storeName].push(key);
        }
        return reaction[key];
      },
      set(nValue) {
        reaction[key] = nValue;
        const ws = reaction.watchers.get(key);
        console.log(ws);
        if (ws) {
          ws.forEach((track, key) => {
            track.autoRun();
          });
        }
      },
    });
  }
  reaction.watchers = new Map();
  keyToBudgeStore.set(storeName, { reaction, reactionProxy });
}

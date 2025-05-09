---
title: React - Hidden Gems
---

# React - Hidden Gems & Lesser-Known Features

Key hidden gems and lesser-known React features include:

- `React.Fragment` shorthand syntax (`<>...</>`)
- `key` prop usage beyond lists (e.g., to reset component state)
- `dangerouslySetInnerHTML` (and when to use it carefully)
- `useImperativeHandle` hook for exposing imperative methods from a child component
- `useDebugValue` for custom hook debugging in React DevTools
- `React.StrictMode` and its benefits during development
- Profiling with `React.Profiler` component
- Forwarding refs with `React.forwardRef`
- Using `displayName` for better debugging of HOCs and anonymous components
- The `children` prop can be a function (render prop pattern)
- `useEffect` with an empty dependency array for `componentDidMount`-like behavior
- `useEffect` returning a cleanup function for `componentWillUnmount`-like behavior
- `useLayoutEffect` for synchronous DOM mutations
- Using `null` or `false` in JSX to render nothing
- `useDeferredValue` for deferring updates to non-critical parts of the UI

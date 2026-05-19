<div align="center">

# Frontend Intern Assignment
**Sarvam AI**

**Name**: Gautam Sidhanth
**Email**: [Your Email]
**Submission Date**: May 19, 2026

</div>

---

## 🔗 Public Links

- **GitHub Repository**: [https://github.com/GautamSidhanth/Sarvam](https://github.com/GautamSidhanth/Sarvam)
- **Deployed Application**: [Insert Vercel/Netlify Link Here]
- **3-Minute Video Walkthrough**: [Watch Video on Google Drive](https://drive.google.com/file/d/1R6Ppubi2nfvaASpb1PC4i2pnzjhqeuQS/view?usp=drive_link)
- **Bug Report**: Integrated below in Section 8.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Inference Playground](#3-inference-playground)
4. [Error Handling Strategy](#4-error-handling-strategy)
5. [Diff Viewer](#5-diff-viewer)
6. [Time Complexity Analysis](#6-time-complexity-analysis)
7. [Accessibility Considerations](#7-accessibility-considerations)
8. [Bug Report](#8-bug-report)
9. [Video Walkthrough](#9-video-walkthrough)
10. [Conclusion](#10-conclusion)

---

## 1. Project Overview

**What the application does:**
This application serves as a modern Developer Portal for interacting with AI models. It features two primary components: an Inference Playground for testing prompt generation and a Diff Viewer for comparing model outputs at a granular, token level.

**Main Features:**
- Real-time token streaming visualization
- Live metrics calculation (Tokens-per-second)
- Resilient error handling with state preservation
- Custom token-level Greedy Lookahead diffing algorithm
- Full keyboard and screen reader accessibility

**Tech Stack:**
- React 18, TypeScript, Vite
- Vanilla CSS (Glassmorphism Design System)
- Lucide React (Icons)

---

## 2. Architecture Decisions

**Why React + TypeScript + Vite?**
- **React**: Enables a highly component-based structure, perfect for separating the Inference Playground and Diff Viewer into reusable logic blocks.
- **TypeScript**: Provides crucial type-safety, particularly important when handling raw byte streams and `TextDecoder` responses.
- **Vite**: Offers instantaneous HMR (Hot Module Replacement) and optimized production builds.

**Component-based structure:**
The UI is modular. `App.tsx` handles top-level routing/tabs, delegating complex logic directly to `Playground.tsx` and `DiffViewer.tsx`, ensuring separation of concerns.

**Mock Backend Approach:**
Because this is a strict frontend assignment, a realistic mock streaming backend was engineered. Using the native `Response` and `ReadableStream` APIs, the mock backend chunks strings and introduces artificial 50-150ms delays, mimicking real-world network latency.

**Streaming Architecture:**
The frontend utilizes a non-blocking `while(true)` asynchronous loop reading from `response.body.getReader()`. As chunks arrive, they are instantly decoded and appended to the React state, rendering fluidly without freezing the main thread.

---

## 3. Inference Playground

The Inference Playground is built to replicate interacting with live LLMs. 

- **Multi-modal Input**: Supports toggling between Text and Audio input modes.
- **Streaming Responses**: Renders tokens to the screen exactly as they arrive from the simulated network.
- **Metrics**: Computes live `Tokens-per-second (t/s)` and tracks the total token count.
- **Real-time Rendering**: State updates happen incrementally, creating a natural typing effect.

*(Please insert your screenshot of the Inference Playground here)*
> **Figure 1**: Real-time token streaming interface with live metrics.

---

## 4. Error Handling Strategy

**Mid-stream Failures & Graceful Recovery:**
If the network drops mid-generation, it's critical not to lose the user's data. The streaming function is wrapped in a `try/catch` block. If a failure occurs, an error banner is presented, but the React state holding the text is preserved.

**AbortController:**
A native `AbortController` is attached to the fetch request. Clicking "Stop Generation" instantly aborts the stream gracefully, preventing memory leaks and orphaned promises.

*(Please insert your screenshot of the Error Handling here)*
> **Figure 2**: Graceful error handling preserving partial stream output.

---

## 5. Diff Viewer

The Diff Viewer is engineered to give developers a granular look at how model responses differ.

**Token-level diffing:**
Rather than diffing line-by-line, strings are parsed down to words and exact punctuation marks using a precise Regular Expression (`/(\s+|\S+)/g`).

**Greedy Lookahead Algorithm:**
The viewer utilizes a custom algorithm that searches outward to find synchronization points when a mismatch is detected, comparing the arrays efficiently.

**Highlighting changes:**
Deleted tokens from Model A are highlighted in red, and added tokens in Model B are highlighted in green.

*(Please insert your screenshot of the Diff Viewer here)*
> **Figure 3**: Token-level diff viewer highlighting additions and deletions.

---

## 6. Time Complexity Analysis

**Traditional diff complexity:**
Standard diffing algorithms like Longest Common Subsequence (LCS) operate in **O(N × M)** time. For long AI outputs, building a massive 2D matrix blocks the JavaScript main thread, causing the browser UI to freeze entirely.

**Your optimized approach:**
The custom Greedy Lookahead algorithm limits the lookahead search radius to a constant bounded limit. This mathematically degrades the complexity to **O(N)** linear time.

**Why I selected this approach:**
I traded mathematically perfect diff scripts over massive text divergences for a lightning-fast, highly accurate localized diff. This ensures the frontend remains perfectly fluid and responsive at all times.

---

## 7. Accessibility Considerations

Ensuring the portal is usable by everyone was a priority:
- **Keyboard Navigation**: All interactive elements (tabs, inputs, buttons) are fully keyboard-navigable.
- **Focus States**: Clear visual focus rings are present for users navigating via `Tab`.
- **aria-live**: The streaming output area utilizes `aria-live="polite"` so screen readers can announce text as it streams in.
- **ARIA labels**: Icon-only buttons (like the microphone toggle) have strict descriptive `aria-label`s.
- **WCAG AA**: Color contrasts and semantics align with standard WCAG AA guidelines.

---

## 8. Bug Report

**Issue:** Punctuation Attached to Words Causes False Negative Diffs  
**Root Cause:** The initial string tokenizer utilized standard `.split(' ')`. Because standard split operations ignore punctuation, trailing punctuation marks were treated as intrinsic parts of words. Changing "word." to "word!" highlighted the entire word rather than just the punctuation mark.  
**Fix:** Rewrote the tokenization algorithm to use precise Regular Expressions: `text.match(/(\s+|\S+)/g)`. This isolates punctuation, allowing the diff viewer to highlight just the changed punctuation mark.  

*(Please insert your screenshot of the Bug Fix here)*
> **Figure 4**: Accurate tokenization separating punctuation from word roots.

---

## 9. Video Walkthrough

**Video Link:** [Watch on Google Drive](https://drive.google.com/file/d/1R6Ppubi2nfvaASpb1PC4i2pnzjhqeuQS/view?usp=drive_link)

**What is shown:**
The 3-minute video demonstrates the complete user journey. It covers the UI design, demonstrates the Inference Playground's real-time streaming and metric tracking, showcases the robustness of the AbortController and mid-stream error preservation, and finally walks through the granular changes in the Diff Viewer.

---

## 10. Conclusion

**Learnings:**
Building a custom diffing algorithm from scratch and orchestrating complex `ReadableStream` logic deepened my understanding of browser performance limitations and linear time trade-offs.

**Challenges:**
Ensuring the UI remained perfectly responsive during rapid state updates from the stream required careful tuning and optimization.

**Final outcome:**
A highly polished, accessible, and performant Developer Portal that accurately replicates the complexities of modern AI streaming interfaces.

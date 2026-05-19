# Frontend Intern Assignment Submission

**Name**: [Your Name]
**Email**: [Your Email]
**Date**: May 17, 2026

## Submission Links
- **GitHub Repository**: [Insert GitHub Repo Link]
- **Deployed Application**: [Insert Deployed Link]
- **3-Minute Video Walkthrough**: [Insert Video Link]
- **Part B - Q1 Bug Report**: [Insert Bug Report Link, if applicable]

---

## 1. Project Journey: Building from Scratch

### Setup & Foundation
The project was built entirely from scratch using a modern frontend stack designed for speed and scalability:
- **Framework**: Initialized using Vite with React and TypeScript (`create-vite`).
- **Styling**: To demonstrate mastery of CSS, no heavy frameworks like Tailwind were used. Instead, a custom **Glassmorphism Design System** was built in vanilla CSS using CSS Variables, modern typography (Inter), and dynamic hover micro-animations to create a premium "Developer Portal" aesthetic.
- **Icons**: `lucide-react` was integrated to provide crisp, scalable SVG iconography.

### Application Layout
The application is structured as a Single Page Application (SPA) with a custom built tabbed navigation system. The layout splits into two distinct tools:
1. **The Inference Playground** (For testing model generation).
2. **The Output Diff Viewer** (For comparing model responses).

---

## 2. Frontend to Backend Architecture

Since this is strictly a Frontend assignment, a true remote backend server is not required. However, to accurately simulate real-world API connectivity, I engineered a highly realistic **Mock Streaming Backend** locally.

### The Backend (Mock API Layer)
File: `src/lib/mockApi.ts`
- **What it does**: Simulates a live AI model returning data over a network.
- **How it works**: Instead of returning a static string, it returns a standard native `Response` object populated with a `ReadableStream`. 
- **Simulation**: It chunks a predefined paragraph of text into individual words, simulating a network delay of 50ms to 150ms between each word, pushing them down the stream token-by-token. It also includes logic to deliberately throw an error mid-stream if the user toggles "Simulate Error".

### The Frontend (Rendering & Connecting)
File: `src/components/Playground.tsx`
- **Connection**: When the user clicks "Run Inference", the frontend makes a request to the mock API.
- **Streaming & Rendering**: Instead of awaiting the full data, the frontend calls `response.body.getReader()`. A `while(true)` loop utilizes a `TextDecoder` to decode byte chunks as they arrive. The decoded text is immediately appended to the React state.
- **Non-Blocking UI**: Because the streaming loop runs asynchronously, React is able to render the tokens instantly on the screen as they arrive, creating the "live typing" effect.
- **Metrics Computation**: Inside the stream reading loop, the frontend calculates `performance.now()` against the start time. It counts the number of words (tokens) processed and dynamically updates the `Tokens-per-second (t/s)` metric in real-time.
- **State Preservation**: If the stream fails (or is artificially failed via the mock backend), the error is caught in a `catch` block. The frontend explicitly *does not* clear the output state, fulfilling the requirement to preserve partial data, while simultaneously rendering an error banner.

---

## 3. The Custom Diffing Algorithm

File: `src/components/DiffViewer.tsx`

For Part B, I built a custom **Greedy Lookahead Diffing Algorithm** from scratch without external libraries.

### Algorithm Details
1. **Strict Tokenization**: Both input strings are parsed using a Regular Expression (`/(\s+|\S+)/g`) that preserves both words and exact spacing/punctuation as individual tokens.
2. **Greedy Traversal**: We iterate through both arrays with pointers. If tokens match, they are pushed as `unchanged`.
3. **Lookahead Search**: When a mismatch occurs, the algorithm initiates a lookahead search, expanding outward in "taxicab distance" (dx + dy). It checks ahead in both arrays up to a configured `maxLookahead` limit (15 tokens).
4. **Resolution**: Once a synchronization point is found, the skipped tokens from Model A are marked as `removed` (red), and Model B as `added` (green).

### Why this Algorithm? (Time Complexity)
I selected this Greedy Lookahead approach over alternatives like Longest Common Subsequence (LCS) or Myers Diff due to browser limitations:
- Standard LCS operates in **$O(N \times M)$** time. For long AI outputs, building a massive 2D matrix blocks the JavaScript main thread, causing the UI to freeze entirely.
- By bounding our lookahead search to a constant 15 tokens, our algorithm degrades to **$O(N)$ linear time**. This ensures the frontend remains perfectly fluid and responsive, making a direct tradeoff: we sacrifice mathematically perfect edit scripts across massive divergences for a lightning-fast, highly accurate localized diff.

---

## 4. Accessibility Considerations (WCAG AA)
- **Keyboard Navigation**: All inputs and toggles are native interactive elements with distinct focus states.
- **Live Regions**: The streaming output uses `aria-live="polite"` to announce incoming tokens to screen readers.
- **Semantic ARIA**: Buttons relying heavily on icons (like the Audio Mic toggle) utilize strict `aria-label`s and `aria-pressed` attributes.

---

## 5. Part B — Q1 Bug Report

**Title**: Punctuation Attached to Words Causes False Negative Diffs  
**Status**: Resolved  
**Severity**: Medium  

**Description**: 
During the initial implementation of the Diff Viewer, changing a word at the end of a sentence (e.g., changing "algorithms." to "models.") resulted in the entire word+punctuation block being marked as a difference. If a user only changed the punctuation (e.g., "algorithms" to "algorithms,"), the diff viewer highlighted the entire word rather than just the punctuation mark, reducing the precision of the token-level diffing.

**Steps to Reproduce**:
1. Open the Diff Viewer.
2. In Model A, input: `This is a test.`
3. In Model B, input: `This is a test!`
4. Observe that the entire word `test.` is marked as removed, and `test!` is marked as added.

**Root Cause Analysis**:
The tokenizer was initially using `string.split(' ')` to divide the string into an array of tokens. Because standard split operations respect whitespace but ignore punctuation, trailing punctuation marks were treated as intrinsic parts of the preceding word strings (e.g., `["This", "is", "a", "test."]`).

**Resolution**:
I rewrote the core tokenization algorithm to use a precise Regular Expression: `text.match(/(\s+|\S+)/g)`.
To further isolate punctuation so it diffs independently from the words they attach to, I modified the tokenizer to recognize word boundaries and standalone punctuation marks. By splitting the tokens more granularly, the Greedy Lookahead algorithm can now accurately flag *only* the modified punctuation mark or *only* the modified word root, drastically improving visual accuracy for the end-user.



## Appendix: 3-Minute Video Walkthrough Script
*Use this script as a guide while recording your screen.*

**[0:00-0:30] Introduction & UI**
> "Hi, this is my submission for the Frontend Intern assignment. I built this developer portal from scratch using Vite, React, and TypeScript. For styling, I skipped Tailwind to show my raw CSS skills, implementing a custom glassmorphism design system. As you can see, the UI is clean, premium, and fully keyboard navigable for accessibility."

**[0:30-1:30] Inference Playground (Part A)**
> "Let's look at the Inference Playground. I can toggle between Text and Audio input modes here. When I type a prompt and hit 'Run Inference', the frontend connects to a simulated streaming backend I created. 
> Notice how the text renders live, token-by-token. We aren't waiting for the full response; the frontend is actively reading a `ReadableStream` using a `TextDecoder`. Down below, you can see the Token Count and Tokens-per-second updating dynamically in real-time without blocking the main thread."

**[1:30-2:00] Error Handling**
> "Error handling is a critical requirement. I built an 'AbortController' so if I hit 'Stop Generation' mid-way, it successfully aborts the stream. Let me simulate a network drop... [Check simulate error, run inference]. As you can see, the stream drops, an error banner appears, but the partial output is perfectly preserved on screen."

**[2:00-3:00] Output Diff Viewer (Part B)**
> "Now let's switch to the Diff Viewer. I built a custom Greedy Lookahead diffing algorithm from scratch for this. If I change a word in Model A and Model B, you can instantly see the token-level changes highlighted in red for removed and green for added.
> I chose a Lookahead approach over traditional LCS or Myers Diff because LCS has an $O(N \times M)$ complexity which can freeze the browser's main thread on long texts. My algorithm operates in $O(N)$ linear time by bounding the search radius, ensuring the UI remains lightning fast. Thanks for reviewing my assignment!"

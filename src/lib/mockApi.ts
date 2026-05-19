export const simulateStreamingResponse = (_prompt: string, errorMidStream: boolean = false): Response => {
  const words = [
    "I", "can", "help", "you", "with", "that.", "Here", "is", "a", "detailed",
    "explanation", "of", "the", "topic", "you", "requested.", "The", "process",
    "involves", "multiple", "steps", "that", "must", "be", "executed", "in",
    "order.", "First,", "we", "initialize", "the", "system.", "Then,", "we",
    "process", "the", "input", "data", "using", "advanced", "algorithms.",
    "Finally,", "we", "generate", "the", "output", "based", "on", "the",
    "results.", "This", "ensures", "optimal", "performance", "and", "accuracy."
  ];

  let index = 0;
  
  const stream = new ReadableStream({
    async start(controller) {
      function push() {
        if (errorMidStream && index === 25) {
          controller.error(new Error("Network connection dropped mid-stream"));
          return;
        }

        if (index < words.length) {
          const encoder = new TextEncoder();
          const token = words[index] + (index === words.length - 1 ? "" : " ");
          controller.enqueue(encoder.encode(token));
          index++;
          
          // Simulate network delay between 50ms and 150ms
          const delay = Math.random() * 100 + 50;
          setTimeout(push, delay);
        } else {
          controller.close();
        }
      }
      
      // Start streaming after an initial delay
      setTimeout(push, 500);
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' }
  });
};

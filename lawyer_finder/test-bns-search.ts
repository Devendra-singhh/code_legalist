import { findRelevantBNSContent } from './lib/ai/embedding';

async function test() {
  const results = await findRelevantBNSContent("murder punishment");
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

test();

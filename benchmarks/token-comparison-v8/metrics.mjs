import {readFile, writeFile} from 'node:fs/promises';

// Read only the two explicitly selected benchmark sessions, excluding approval agents.
const paths = process.argv.slice(2);
if (paths.length !== 2) throw new Error('Expected framework and scratch session paths');
const reports = [];
for (const path of paths) {
  const records = (await readFile(path, 'utf8')).split('\n').filter(Boolean).map(line => JSON.parse(line));
  const meta = records.find(record => record.type === 'session_meta')?.payload;
  const usageRecords = records.filter(record => record.type === 'token_usage_record');
  const usage = usageRecords.at(-1)?.payload.thread_token_usage;
  if (!usage) throw new Error('Missing token usage: ' + path);
  const starts = records.filter(record => record.type === 'event_msg' && record.payload.type === 'task_started');
  const completions = records.filter(record => record.type === 'event_msg' && record.payload.type === 'task_complete');
  const start = starts[0]?.timestamp ?? records[0].timestamp;
  const end = completions.at(-1)?.timestamp;
  const contexts = records.filter(record => record.type === 'turn_context');
  reports.push({
    agent: meta?.source?.subagent?.thread_spawn?.agent_path,
    session: meta?.id,
    model: contexts[0]?.payload.model,
    effort: contexts[0]?.payload.effort,
    completed: Boolean(end), start, end,
    elapsedSeconds: end ? Math.round((Date.parse(end) - Date.parse(start)) / 1000) : null,
    ...usage,
    uncached_input_tokens: usage.input_tokens - usage.cached_input_tokens,
    uncached_plus_output: usage.input_tokens - usage.cached_input_tokens + usage.output_tokens,
    responses: new Set(usageRecords.map(record => record.payload.response_id)).size,
    toolCalls: records.filter(record => record.type === 'response_item' && ['function_call', 'custom_tool_call'].includes(record.payload.type)).length,
  });
}
await writeFile(new URL('./metrics.json', import.meta.url), JSON.stringify(reports, null, 2) + '\n');
console.log(JSON.stringify(reports, null, 2));

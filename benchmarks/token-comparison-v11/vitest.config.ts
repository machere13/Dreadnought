import {defineConfig} from 'vitest/config';
export default defineConfig({
  // Both agents chose a single entry file. Export App only inside the test runner;
  // do not change either measured implementation or execute its browser mount.
  plugins: [{name:'test-entry', enforce:'pre', transform(code, id) {
    if (!/token-comparison-v11\/(with|without)-dreadnought\/src\/main\.tsx$/.test(id.replaceAll('\\','/'))) return;
    return code.replace(/createRoot\(document\.getElementById\('root'\)!\)\.render\([\s\S]*?\);\s*$/, 'export default App;');
  }}],
  logLevel: 'error', resolve: {dedupe: ['react', 'react-dom']}, esbuild: {jsx: 'automatic'}, test: {
  include: ['benchmarks/token-comparison-v11/smoke.test.tsx'],
  server: {deps: {inline: [/@dreadnought/]}},
}});

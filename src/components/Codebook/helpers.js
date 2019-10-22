import { reduce, get, compact, uniq } from 'lodash';
import { getProtocol } from '@selectors/protocol';

/**
 * Extract a list of stage names from the app state
 * @param {Object} state Application state
 * @returns {string[]} Stage names sorted by index in state
 */
const getStageNamesByIndex = (state) => {
  const protocol = getProtocol(state);
  return protocol.stages
    .map(({ label }) => label);
};

/**
 * Extract the stage name from a path string
 * @param {string} path {}
 * @returns {string | null} return a stageIndex or null if stage not found.
 */
const getStageIndexFromPath = (path) => {
  const matches = /stages\[([0-9]+)\]/.exec(path);
  return get(matches, 1, null);
};

/**
 * Filters a usage index for items that match value.
 * @param {Object.<string, string>}} index Usage index in (in format `{[path]: value}`)
 * @param {any} value Value to match in usage index
 * @returns {string[]} List of paths ("usage array")
 */
export const getUsage = (index, value) =>
  reduce(index, (acc, indexValue, path) => {
    if (indexValue !== value) { return acc; }
    return [...acc, path];
  }, []);

/**
 * Get a list of stage names for a "usage array" (see `getUsage()`),
 * deduped. Any stages that can't be found in the index are omitted.
 * @param {Object} state Application state
 * @param {string[]} usage "Usage array"
 * @returns {string[]} List of stage labels.
 */
export const getUsageAsStageName = (state, usage) => {
  const stageNamesByIndex = getStageNamesByIndex(state);
  const stageIndexes = compact(uniq(usage.map(getStageIndexFromPath)));
  return stageIndexes.map(stageIndex => get(stageNamesByIndex, stageIndex));
};

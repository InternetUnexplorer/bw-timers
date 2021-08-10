import { SpawnTable, SpawnTableRow } from "./spawntable.mjs";

////////////////////////////////////////////////

// How often to update everything, in milliseconds.
export const UPDATE_INTERVAL_MS = 1000 / 60; // 60Hz

// The spawn tables for emeralds and diamonds.
// The default spawn rates are completely made up; you will need to edit them.
//
// Each row takes three arguments:
// - The first argument is the name, which might be shown in a future update.
// - The second argument is the number of seconds (from the start of the game)
//   until this row becomes "active".
// - The third argument is the interval (in seconds) at which spawns happen.
//
// The following must be true:
// - Tables must have at least one row.
// - The first row in a table must start at 0 seconds.
// - The row times must be strictly increasing.
// - The row intervals must be strictly decreasing.
// - The duration that a row is "active" (i.e. the time between when it starts
//   and the time when the next row starts) must be a multiple of the interval.
//
// Check the console for an error message if things aren't working.
export const EMERALD_ST = new SpawnTable([
  new SpawnTableRow("Emerald I", 0, 60),
  new SpawnTableRow("Emerald II", 120, 30),
  new SpawnTableRow("Emerald III", 240, 15),
]);
export const DIAMOND_ST = new SpawnTable([
  new SpawnTableRow("Diamond I", 0, 60),
  new SpawnTableRow("Diamond II", 60, 30),
  new SpawnTableRow("Diamond III", 180, 15),
]);

////////////////////////////////////////////////

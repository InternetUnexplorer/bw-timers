import { UPDATE_INTERVAL_MS, EMERALD_ST, DIAMOND_ST } from "./config.mjs";
import { formatTime } from "./utils.mjs";

////////////////////////////////////////////////

function updateStopwatch(millisElapsed) {
  // Update time
  $("#stopwatch-time").text(formatTime(millisElapsed || 0, true));
  // Update button
  const isRunning = millisElapsed !== null;
  const newClass = isRunning ? "btn--gray" : "btn--green";
  const newValue = isRunning ? "Reset" : "Start";
  $("#stopwatch-button").attr("class", newClass);
  $("#stopwatch-button").attr("value", newValue);
}

function updateCounters(millisElapsed) {
  const secsElapsed =
    millisElapsed !== null ? Math.floor(millisElapsed / 1000) : null;

  function updateCounter(spawnTable, idPrefix, labelSingular, labelPlural) {
    // Get the number of generators.
    const numGenerators = parseInt($(`#${idPrefix}-num-generators`).val());

    // Update the number spawned.
    const numSpawns = spawnTable.getNumSpawns(secsElapsed || 0) * numGenerators;
    $(`#${idPrefix}-counter`).text(`${numSpawns}`);

    // Update the text next to the counter.
    $(`#${idPrefix}-counter-label`).text(
      numSpawns === 1 ? labelSingular : labelPlural
    );

    // Update the amount of time before the next spawn.
    const millisRemaining =
      secsElapsed !== null
        ? spawnTable.getNextSpawnSec(secsElapsed) * 1000
        : null;
    const timeText = $(`#${idPrefix}-time`).text(
      formatTime(millisRemaining, false)
    );
  }

  updateCounter(EMERALD_ST, "emerald", "Emerald", "Emeralds");
  updateCounter(DIAMOND_ST, "diamond", "Diamond", "Diamonds");
}

////////////////////////////////////////////////

let isRunning = false;
let startTime = null;
let intervalId = null;

function update() {
  const millisElapsed = isRunning ? Date.now() - startTime : null;
  updateStopwatch(millisElapsed);
  updateCounters(millisElapsed);
}

function start() {
  isRunning = true;
  startTime = Date.now();
  intervalId = setInterval(update, UPDATE_INTERVAL_MS);
  update();
}

function reset() {
  clearInterval(intervalId);
  isRunning = false;
  startTime = null;
  update();
}

////////////////////////////////////////////////

$("#emerald-num-generators").change(update);
$("#diamond-num-generators").change(update);

$("#stopwatch-button").on("click", () => {
  if (isRunning) {
    if (confirm("Are you sure you want to reset the timers?")) {
      reset();
    } else {
      update();
    }
  } else {
    start();
  }
});

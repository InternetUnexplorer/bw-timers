import { loadProfiles } from "./config.mjs";
import { Timer } from "./utils.mjs";
import { formatTime } from "./utils.mjs";

////////////////////////////////////////////////

let profiles = null;

////////////////////////////////////////////////

function updateControls(secsElapsed) {
  const isRunning = secsElapsed !== null;
  // Update time
  $("#stopwatch-time").text(formatTime(secsElapsed || 0));
  // Update profile selector
  $("#profile-selector").prop("disabled", isRunning);
  // Update button
  const newClass = isRunning ? "btn--gray" : "btn--green";
  const newValue = isRunning ? "Reset" : "Start";
  $("#stopwatch-button").attr("class", newClass);
  $("#stopwatch-button").attr("value", newValue);
}

function updateCounters(secsElapsed) {
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
    const secsRemaining =
      secsElapsed !== null ? spawnTable.getNextSpawnSec(secsElapsed) : null;
    const timeText = $(`#${idPrefix}-time`).text(formatTime(secsRemaining));
  }

  // Get the current profile.
  const currentProfile = profiles[parseInt($("#profile-selector").val())];

  updateCounter(currentProfile.emeraldST, "emerald", "Emerald", "Emeralds");
  updateCounter(currentProfile.diamondST, "diamond", "Diamond", "Diamonds");
}

////////////////////////////////////////////////

let timer = null;
let secsElapsed = null;

function update() {
  updateControls(secsElapsed);
  updateCounters(secsElapsed);
}

function start() {
  timer = new Timer((millisElapsed) => {
    secsElapsed = Math.round(millisElapsed / 1000);
    update();
  }, 1000);
  secsElapsed = 0;
  update();
}

function reset() {
  timer.stop();
  timer = null;
  secsElapsed = null;
  update();
}

////////////////////////////////////////////////

// Load the profiles from profiles.json.
try {
  profiles = await loadProfiles();
} catch (error) {
  $("#config-error-message").show();
  throw error;
}

// Add the loaded profiles to the profile selector.
profiles.forEach((profile, index) => {
  $("#profile-selector").append(
    $("<option>", {
      value: index,
      text: profile.name,
    })
  );
});

$("#emerald-num-generators").change(update);
$("#diamond-num-generators").change(update);

$("#stopwatch-button").on("click", () => {
  if (timer !== null) {
    reset();
  } else {
    start();
  }
});

update();

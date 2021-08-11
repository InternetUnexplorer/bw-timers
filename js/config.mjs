class ConfigError extends Error {
  constructor(message, profileName, rowName) {
    if (profileName) {
      message += `\n  Profile: ${profileName}`;
    }
    if (rowName) {
      message += `\n      Row: ${rowName}`;
    }
    super(message);
    this.name = "ConfigError";
  }
}

function configAssert(expr, message, profileName, rowName) {
  if (!expr) throw new ConfigError(message, profileName, rowName);
}

////////////////////////////////////////////////

export class SpawnProfile {
  constructor(name, profileJSON) {
    // Assert that the profile JSON value is an object.
    configAssert(
      $.type(profileJSON) === "object",
      "profile value must be an object"
    );

    this.name = name;
    this.emeraldST = new SpawnTable(name, profileJSON.emeraldST);
    this.diamondST = new SpawnTable(name, profileJSON.diamondST);
  }
}

export class SpawnTable {
  constructor(profileName, tableJSON) {
    // Assert that the table JSON value is an array.
    configAssert(
      $.type(tableJSON) === "array",
      "spawn table value must be an array",
      profileName
    );

    // Load the rows in the array.
    let rows = tableJSON.map(
      (rowJSON) => new SpawnTableRow(profileName, rowJSON)
    );

    // Assert that there is at least one row.
    configAssert(
      rows.length > 0,
      "there must be at least one row",
      profileName
    );

    // Assert that the first row starts at 0s.
    configAssert(
      rows[0].time === 0,
      "the first row must have time = 0",
      profileName,
      rows[0].name
    );

    // Assert that row times are strictly increasing and row intervals are
    // strictly decreasing.
    rows.slice(1).forEach((row, index) => {
      configAssert(
        row.time > rows[index].time,
        "row times must be strictly increasing",
        profileName,
        row.name
      );
      configAssert(
        row.interval < rows[index].interval,
        "row intervals must be strictly decreasing",
        profileName,
        row.name
      );
    });

    // Round the row start times up so they each starts when the interval of the
    // previous row finishes.
    rows.slice(1).forEach((row, index) => {
      const prev = rows[index];

      // The chances of a row starting before the first spawn of the previous
      // row has happened are basically zero, but this handles that scenario
      // just in case.
      let duration = row.time - prev.time;
      if (duration <= 0) {
        duration = 1;
        row.time = prev.time + 1;
      }

      if (duration % prev.interval !== 0) {
        row.time += prev.interval - (duration % prev.interval);
      }
    });

    this.rows = rows;
  }

  // Compute the number of spawns that have happened so far.
  getNumSpawns(secsElapsed) {
    return this.rows.reduce((numSpawns, row, index) => {
      // Compute the time that this row has been active so far (i.e. that its
      // rate has been the current rate).

      // Make the lower bound for secsActive 0, for when the row has not been
      // active yet.
      let secsActive = Math.max(secsElapsed - row.time, 0);
      // Make the upper bound for secsActive the time between it and the next
      // row (if there is one), for when the row is no longer active.
      if (index !== this.rows.length - 1) {
        secsActive = Math.min(this.rows[index + 1].time - row.time, secsActive);
      }

      // Add the number of spawns that occurred within this time.
      return numSpawns + Math.floor(secsActive / row.interval);
    }, 0);
  }

  // Compute the number of seconds until the next spawn.
  getNextSpawnSec(secsElapsed) {
    // Find the current row.
    const currentRow = this.rows
      .slice()
      .reverse()
      .find((row) => row.time <= secsElapsed);
    // Compute the number of seconds until the next spawn for this row.
    return (
      currentRow.interval -
      ((secsElapsed - currentRow.time) % currentRow.interval)
    );
  }
}

export class SpawnTableRow {
  constructor(profileName, rowJSON) {
    // Assert that the row JSON value is an object.
    configAssert(
      $.type(rowJSON) === "object",
      "row value must be an object",
      profileName
    );

    // Assert that the row JSON value has a name that is a string.
    const name = rowJSON.name;
    configAssert(
      $.type(name) === "string",
      "row name must be a string",
      profileName
    );

    // Assert that the row JSON value has a start time that is a nonnegative
    // integer.
    const time = rowJSON.time;
    configAssert(
      Number.isInteger(time) && time >= 0,
      "row start time must be a nonnegative integer",
      profileName,
      name
    );

    // Assert that the row JSON value has a spawn interval that is a positive
    // integer.
    const interval = rowJSON.interval;
    configAssert(
      Number.isInteger(interval) && interval > 0,
      "row spawn interval must be a positive integer",
      profileName,
      name
    );

    this.name = name;
    this.time = time;
    this.interval = interval;
  }
}

export async function loadProfiles() {
  // Load the profiles from profiles.json.
  const profilesJSON = await $.getJSON("profiles.json");

  // Assert that the loaded JSON value is an object.
  configAssert(
    $.type(profilesJSON) === "object",
    "root profiles.json value must be an object"
  );

  // Load the profiles in the object.
  let profiles = [];
  for (const name in profilesJSON) {
    // Assert that the profile name is a string.
    configAssert($.type(name) === "string", "profile name must be a string");

    // Load the profile.
    profiles.push(new SpawnProfile(name, profilesJSON[name]));
  }

  // Sort the profiles alphabetically by name.
  profiles.sort((profileA, profileB) => {
    if (profileA.name < profileB.name) {
      return -1;
    }
    if (profileA.name > profileB.name) {
      return 1;
    }
    return 0;
  });

  return profiles;
}

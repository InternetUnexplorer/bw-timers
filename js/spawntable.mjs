function assert(expr, message, rowName) {
  if (!expr) {
    if (rowName === undefined) {
      throw new Error("Config Error: " + message);
    } else {
      throw new Error("Config Error: " + message + " (row = " + rowName + ")");
    }
  }
}

////////////////////////////////////////////////

export class SpawnTableRow {
  constructor(name, time, interval) {
    // Assert that the time and interval are nonzero and positive integers.
    assert(Number.isInteger(time), "time must be an integer");
    assert(Number.isInteger(interval), "interval must be an integer");
    assert(time >= 0, "time must be >= 0");
    assert(interval > 0, "interval must be > 0");

    this.name = name;
    this.time = time;
    this.interval = interval;
  }
}

export class SpawnTable {
  constructor(rows) {
    // Assert that there is at least one row.
    assert(rows.length > 0, "there must be at least one row");
    // Assert that the first row starts at 0s.
    assert(
      rows[0].time === 0,
      "the first row must have time = 0",
      rows[0].name
    );

    // Assert that row times are strictly increasing and row intervals are
    // strictly decreasing.
    rows.slice(1).forEach((row, index) => {
      assert(
        row.time > rows[index].time,
        "row times must be strictly increasing",
        row.name
      );
      assert(
        row.interval < rows[index].interval,
        "row intervals must be strictly decreasing",
        row.name
      );
    });

    // Round the row start times up so they each starts when the interval of the
    // previous row finishes.
    rows.slice(1).forEach((row, index) => {
      const prev = rows[index];

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

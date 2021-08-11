# Bedwars Timers

This is a simple static site I made to track resource spawning in Minecraft
Bedwars. I've been playing it a lot with my friends recently, and it's useful to
be able to tell how e.g. how many emeralds have spawned so far in the current
round (so we know how many the other teams might have) and when the next set
will spawn.

It's also my first time making a website, so I'll probably keep changing and
improving it if I have time, since I'm trying to learn more about how web
development works.

### How to use it

This is a static site. Just clone the repo and host it however.

At the moment the default spawn tables in `profiles.json` are meaningless. You
will need to edit them first.

### Configuration Format

The profiles in `profiles.json` look like this:

```jsonc
{
  "Profile Name": {
    "emeraldST": [
      { "name": "Row Name", "time": 0, "interval": 1 }
      /* ... */
    ],
    "diamondST": [
      /* same as emeraldST */
    ]
  }
  /* ... */
}
```

The rules are as follows:

- The root object must be an object mapping profile names to profiles.
- Each profile must have two spawn tables: `emeraldST` and `diamondST`.
- For each table,
  - The table must have at least one row.
  - The first row in the table must have `time = 0`.
  - The row times must be strictly increasing.
  - The row intervals must be strictly decreasing.
- Each row must have the following three fields:
  - `name`: the name, which might be shown in a future update.
  - `time`: the number of seconds (from the start of the game) until the row
    becomes "active".
  - `interval`: the interval (in seconds) at which spawns happen.

### License

Licensed under the [MIT License][1]. Uses [Furtive][2], which is [also licensed under the MIT License][3].

[1]: https://mit-license.org/
[2]: https://github.com/johno/furtive
[3]: https://github.com/johno/furtive/blob/master/LICENSE

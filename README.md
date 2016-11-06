# driftin.io bots

Bots for [driftin.io](http://driftin.io) written by InitialFail.

Currently there are two bots. The original bot is a Buster aimbot, and another is a racing bot for Drift Race mode.

Both bots are a WIP. See the Issues page for planned features, bug fixes, and proposed ideas.

## How to use

Theoretically, these bots should work on any modern web browser. All of the files needed to run the bots are already in this repository. They can be invoked by launching the appropriate index HTML file:
* `index.html` is for the Buster aimbot in Free for All mode
* `index_race.html` is for the Flash racing bot in Drift Race mode

**NOTE**: These bots requires cross-domain requests to work properly. Browsers prevent this by default, but it can be configured. On Chrome/Chromium, you can use the `--disable-web-security` argument. It is also recommended to use the `--user-data-dir` flag, otherwise it will use the default profile (which means that a new browser instance with these flags will not be launched if the browser is already running).

For your convenience, there are shell scripts for Linux and Chromium that will launch the bots for you:
* `start_freeforall.sh` starts the Buster aimbot
* `start_race.sh` starts the Flash racing bot

## Contributing

Leave problems, suggestions, and questions on the Issues page. Pull requests are okay too, but large changes should be proposed through an issue first (unless it's already planned and I'm not working on it).

## License

MIT License. See [LICENSE](LICENSE).

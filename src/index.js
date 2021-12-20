const mix = require("laravel-mix");
const { exec } = require("child_process");
const chalk = require("chalk");

class ZiggyWatch {
	isHot() {
		return process.argv.includes("--hot");
	}

	isWatching() {
		return this.isHot() || process.argv.includes("--watch");
	}

	register(config = {}) {
		this.watch = config.watch ?? ["routes/**/*.php"];
		this.output = config.output ?? "";
		this.production = config.production ?? true;
		this.development = config.development ?? true;
	}

	boot() {
		if (!this.production && mix.inProduction()) return;
		if (!this.development && !mix.inProduction()) return;

		const cmd = () =>
			exec(`php artisan ziggy:generate ${this.output}`, (error, stdout, stderr) => {
				if (error) {
					throw new Error(error);
				}
				if (stdout) console.log(`${chalk.blue.bold("Ziggy Watch")}: ${stdout}`);
				if (stderr) console.log(`${chalk.white.bgRed.bold("Ziggy Watch")} ${stderr}`);
			});

		cmd();

		if (this.isWatching() && this.watch) {
			const chokidar = require("chokidar");
			chokidar.watch(this.watch).on("change", (path) => {
				console.log(`${chalk.blue.bold("Ziggy Watch")}: ${path} has changed, rebuilding routes...`);
				cmd();
			});
		}
	}
}

mix.extend("ziggyWatch", new ZiggyWatch());

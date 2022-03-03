const mix = require("laravel-mix");
const { exec } = require("child_process");
const chalk = require("chalk");
const fs = require("fs");

class ZiggyWatch {
  isHot() {
    return process.argv.includes("--hot");
  }

  isWatching() {
    return this.isHot() || process.argv.includes("--watch");
  }

  register(config = {}) {
    this.watch = config.watch ?? ["routes/**/*.php"];
    this.include = config.include;
    this.exclude = config.exclude;
    this.output = config.output ?? "";
    this.baseUrl = config.baseUrl;
    this.production = config.production ?? true;
    this.development = config.development ?? true;
  }

  replaceBaseUrl(routes) {
    return routes.replace(
      /("url"\s*?:\s*?")(.*?)(")/,
      "$1" + this.baseUrl + "$3"
    );
  }

  filterRoutes() {
    try {
      let routes = fs.readFileSync(this.output, { encoding: "utf8" });
      if (typeof this.baseUrl !== "undefined")
        routes = this.replaceBaseUrl(routes);
      const Ziggy = JSON.parse(routes.match(/(?:const Ziggy = )({.*})/).pop());
      Ziggy.routes = Object.fromEntries(
        Object.entries(Ziggy.routes).filter(([route, routeObject]) => {
          if (this.exclude && Array.isArray(this.exclude)) {
            return this.exclude.every((ex) => {
              const regex = new RegExp(ex);
              return regex.test(route) === false;
            });
          } else if (this.include && Array.isArray(this.include)) {
            return this.include.some((inc) => {
              const regex = new RegExp(inc);
              return regex.test(route) === true;
            });
          }
        })
      );
      const content = `const Ziggy = ${JSON.stringify(Ziggy)};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };`;
      fs.writeFileSync(this.output, content, { encoding: "utf8" });
    } catch (e) {
      console.log(
        `${chalk.white.bgRed.bold("Ziggy Watch")}: Error filtering routes`
      );
    }
  }

  boot() {
    if (!this.production && mix.inProduction()) return;
    if (!this.development && !mix.inProduction()) return;

    const cmd = () =>
      exec(
        `php artisan ziggy:generate ${this.output}`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            if (fs.existsSync(this.output)) {
              console.log(
                `${chalk.white.bgRed.bold(
                  "Ziggy Watch: "
                )} Error building routes file. Using previous build.`
              );
              console.log(error || stderr);
            } else {
              console.log(
                `${chalk.white.bgRed.bold(
                  "Ziggy Watch: "
                )} Error building routes file. No previous routes build. Aborting.`
              );
              throw new Error(error);
            }
          }
          if (this.exclude || this.include) this.filterRoutes();
          if (stdout)
            console.log(`${chalk.blue.bold("Ziggy Watch")}: ${stdout}`);
        }
      );

    cmd();

    if (this.isWatching() && this.watch) {
      const chokidar = require("chokidar");
      chokidar.watch(this.watch).on("change", (path) => {
        console.log(
          `${chalk.blue.bold(
            "Ziggy Watch"
          )}: ${path} has changed, rebuilding routes...`
        );
        cmd();
      });
    }
  }
}

mix.extend("ziggyWatch", new ZiggyWatch());

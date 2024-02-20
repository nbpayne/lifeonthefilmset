# jekyll-starter

Starter template for a Jekyll site including:

- Gulp tasks to improve the speed of development by:
- Automatically wiring bower dependencies
- Building bootstrap CSS from SASS
- Building app CSS from SASS
- Minifying CSS, and creating sourcemaps
- Combining vendor JS files, linting, minifying, and creating sourcemaps
- Combining app JS files, linting, minifying, and creating sourcemaps
- Livereloading the site during development

## Installation

1. Download the start template from here: https://github.com/nbpayne/jekyll-starter/archive/master.zip.
2. Unzip into a new directory.
3. Run `bundle install` to install Jekyll, and plugins.
4. Change directory and run `yarn` or `npm install` to install all server dependencies
5. Run `bower install` to install the client dependencies
6. Run `gulp serve`
7. Open http://127.0.0.1:4000 and view the site

## Directory structure

```
.
├── __includes/       # Wiredep injects bower dependencies into `head.html`, and `foot.html` inside this folder. `gulp js` builds these files to `_includes/`. 
├── __js/             # Create your javascript files here. `gulp js` builds them to `js/`.
├── __sass/           # Place your SASS files here. `gulp css` builds these to `css/`.
├── _includes/        # `head.html`, and `foot.html` are built to here. Other includes can also be placed in this folder.
├── _layouts/         # Jekyll layouts.
├── _site/            # Jekyll builds the site into this folder.
├── bower_components/ # Bower dependencies are installed here. This folder is not built by Jekyll.
├── css/              # SASS files are built into CSS files, and served from here.
├── js/               # JS files a built, and served from here.
├── node_modules/     # Server dependencies. This folder is not built by Jekyll.
├── .gitignore        # Make sure Git ignores stuff we don't need.
├── 404.html          # Example 404 page.
├── _config.yml       # Jekyll config.
├── about.md          # Example about page.
├── bower.json        # Bower dependencies defined here.
├── Gemfile           # Jekyll gem is listed here.
├── gulpfile.js       # Gulp tasks.
├── package.json      # NPM modules used by Gulp.
├── README.md         # This README.
└── robots.txt        # Robots file
```
const http = require('http');

const hostname = '127.0.0.1';
const port = 1337;

const configpath = '/Users/phajas/.controlsurface';

var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var configFile = yaml.safeLoad(fs.readFileSync(configpath, 'utf8'));

// Load the config file

var controls = configFile['Controls'];
var layout = configFile['Layout'];
var commands = { }

// Load layout

// Units wide is just the length of the first line

var unitWidth = layout.split(" ")[0].length

// Units high is how many spaced elements there are
// (the YAML parser inserts spaces between these, it seems)
var unitHeight = layout.split(" ").length

// We want to build a mapping between keynum (which is used to indicate the
// control dimension in the layout) and its origin and size information
//
// 0 is a special keynum - it means whitespace

var keynumGeometry = { }

for(var x = 0; x < unitWidth; x++) {
    for(var y = 0; y < unitHeight; y++) {
        var row = layout.split(" ")[y];
        var element = row[x];

        if (element != 0) {
            var geometry;
            if (!(element in keynumGeometry)) {
                // Make an entry for this element
                geometry = { };
                geometry['x'] = x;
                geometry['y'] = y;
                geometry['w'] = 1;
                geometry['h'] = 1;
            }
            else {
                geometry = keynumGeometry[element];
                elemX = geometry['x'];
                elemY = geometry['y'];
                elemW = geometry['w'];
                elemH = geometry['h'];

                if ((x - elemX) + 1 > elemW) {
                    width = (x - elemX) + 1;
                    geometry['w'] = width;
                }
                if ((y - elemY) + 1 > elemH) {
                    height = (y - elemY) + 1;
                    geometry['h'] = height;
                }
            }

            keynumGeometry[element] = geometry;
        }
    }
}

// Load controls

for(var index in controls) {
    var entry = controls[index];
    var name = Object.keys(entry)[0];
    entry = entry[name];
    var command = entry['command'];
    var shortname = entry['short'];
    var type = entry['type'];
    var keynum = entry['keynum'];
    
    var command_entry = { }
    command_entry['name'] = name;
    command_entry['command'] = command;
    command_entry['type'] = type;
    command_entry['keynum'] = keynum;
    command_entry['geometry'] = keynumGeometry[keynum];

    commands[shortname] = command_entry
}

console.log(commands);

// Load HTML files used to serve the main page

var controlsurfacePath = path.dirname(require.main.filename);
var pageTemplatePath = controlsurfacePath + '/page_template.html'
var pageTemplate = fs.readFileSync(pageTemplatePath, 'utf8');

// Start listening to requests

http.createServer((req, res) => {
    url = req.url;
    res.writeHead(200, { 'Content-Type': 'text/html' });

    if (url == '/') {
        // Serve the main page

        var contents = pageTemplate;

        // Make HTML for all the controls

        var controlHTML = "<!-- Controls -->";

        for(var shortname in commands) {
            var entry = commands[shortname];
            var name = entry['name'];
            var geometry = entry['geometry'];
            var x = geometry['x'] / unitWidth;
            var y = geometry['y'] / unitHeight;
            var w = geometry['w'] / unitWidth;
            var h = geometry['h'] / unitHeight;

            var leftStyle = "left: " + 100 * x + "vw;";
            var topStyle = "top: " + 100 * y + "vh;";
            var widthStyle = "width: " + 100 * w + "vw;";
            var heightStyle = "height: " + 100 * h + "vh;";

            var elementStyle = "position: absolute;" + leftStyle + topStyle + widthStyle + heightStyle;

            var nameHTML = '<h1>'+name+'</h1>'
            var shortnameHTML = '<h2>'+shortname+'</h2>'

            var elementHTML = '<span style=\"' + elementStyle + '\" class=\'control\'>' + nameHTML + shortnameHTML + '</span>';

            controlHTML += elementHTML
        }

        contents = contents.replace("<!-- CONTROLS -->", controlHTML);

        res.end(contents);
    }
    else {
        // Perform a command's action
        var shortname = url.substring(1, url.length);

        var command_entry = commands[shortname];

        if (command_entry != null) {
            command = command_entry['command'];
            exec(command_entry['command']);
            res.end('Found command, running ' + command + '\n');
        }
        else {
            res.end('Could not find command ' + shortname + '\n');
        }
    }
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

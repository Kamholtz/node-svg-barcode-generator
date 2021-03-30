// Simple HTTP server that renders barcode images using bwip-js.
const http   = require('http');
const bwipjs = require('bwip-js');
const DrawingSVG = require('./drawing-svg');
var url = require('url');

// This shows how to load the Inconsolata font, supplied with the bwip-js distribution.
// The path to your fonts will be different.
//bwipjs.loadFont('Inconsolata', 100,
//      require('fs').readFileSync('./fonts/Inconsolata.otf', 'binary'));

http.createServer(function(req, res) {
    // If the url does not begin /?bcid= then 404.  Otherwise, we end up
    // returning 400 on requests like favicon.ico.
    if (req.url.indexOf('/?bcid=') != 0) {
        res.writeHead(404, { 'Content-Type':'text/plain' });
        res.end('BWIPJS: Unknown request format. http://192.168.1.22:3030/?bcid=code39&text=DJD545484&includetext', 'utf8');
    } else {
        // bwipjs.request(req, res); // Executes asynchronously
		requestSvg(req, res);
    }

}).listen(3030, "0.0.0.0");

function requestSvg(req, res, extra) {
	var opts = url.parse(req.url, true).query;

	// Convert boolean empty parameters to true
	for (var id in opts) {
		if (opts[id] === '') {
			opts[id] = true;
		}
	}

	// Add in server options/overrides
	if (extra) {
		for (var id in extra) {
			opts[id] = extra[id];
		}
	}

	ToBuffer(opts, function(err, svg) {
		if (err) {
			res.writeHead(400, { 'Content-Type':'text/plain' });
			res.end('' + (err.stack || err), 'utf-8');
		} else {
			res.writeHead(200, { 'Content-Type':'image/svg+xml' });
			res.end(svg, 'binary');
		}
	});
}

function ToBuffer(opts, callback) {
	try {
		bwipjs.fixupOptions(opts);
		var svg = bwipjs.render(opts, DrawingSVG(opts, bwipjs.FontLib))
		callback(null, svg);
	} catch (e) {
		if (callback) {
			callback(e);
		} else {
			return new Promise(function(resolve, reject) {
				reject(e);
			});
		}
	}
}
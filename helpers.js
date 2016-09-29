/**
 * Created by allancutler on 9/27/16.
 */
'use strict';

const spawn = require('child_process').spawn;

/**
 * Run CLI command
 *
 * @param {String} name
 * @param {Object} config
 * @param {Boolean} config.hideOutput
 * @param {Array} options - additional cli flags and parameters
 */
exports.runCommand = function(name, options, config) {
    config = config || { hideOutput: false };

    const command = spawn(name, options, { cwd: process.cwd() });

    //stdout
    command.stdout.setEncoding('utf8');
    command.stdout.on('data', data => {
        if(!config.hideOutput) console.info(data);
    });

    // stderr
    command.stderr.setEncoding('utf8');

    return command;
};

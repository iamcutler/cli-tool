/**
 * Created by allancutler on 9/28/16.
 */
'use strict';

const async = require('async');
const helpers = require('../helpers');
const colors = require('colors');

/**
 * Get Node Package Manager identity
 * @param {npmCallback} cb
 */
exports.whoAmI = (cb) => {
    helpers.runCommand("npm", ["whoami"], {
            hideOutput: true
        })
        .stdout.on('data', data => cb(null, data))
        .on('error', err => cb(err, null));
};

/**
 * Get package.json information
 * @param {npmCallback} cb
 */
exports.getPackageInfo = (cb) => {
    try {
        helpers.runCommand("cat", ["package.json"], {
                hideOutput: true
            })
            .stdout.on('data', data => {
                return cb(null, JSON.parse(data));
            })
            .on('error', err => cb(err, null));
    } catch(e) {
        cb(e);
    }
};

/**
 * Publish NPM private package
 *
 * @param {String} name
 * @param {String} version
 * @param {Boolean} isRelease
 * @param {npmCallback} cb
 */
exports.publish = function(name, version, isRelease, cb) {
    async.series([
        // Validate user
        (callback) => {
            exports.whoAmI((err, user) => {
                if(err) return callback(err, null);

                // Available users to deploy releases
                const userWhiteList = ['npm-username', 'iamcutler'];

                // validate
                if(isRelease && userWhiteList.indexOf(user.trim()) === -1) {
                    return callback(new Error('You do not have permission to do a production release'));
                }

                callback(null, user);
            });
        },
        // Validate package information
        (callback) => {
            exports.getPackageInfo((err, pkg) => {
                if(err) return callback(err);

                if(pkg.name !== name) {
                    return callback(
                        new Error(`Package name goes not match targeted package. Current Project: ${colors.red(pkg.name)}, Desired Project: ${colors.green(name)}`)
                    );
                }

                callback(null);
            });
        },
        //Run test suite
        (callback) => {
            console.info('Running test suite:');

            const command = helpers.runCommand("npm", ["test"]);

            command
                .stderr.on('data', data => {
                    console.error(data);
                    command.kill();
                })
                .on('error', err => callback(err))
                .on('finish', data => callback(null, data))
                .on('exit', data => callback(null, data));
        },
        // Run application build
        (callback) => {
            console.info('Running app build:');

            const command = helpers.runCommand("npm", ["run", "build"]);

            command
                .stderr.on('data', data => {
                    console.error(data);
                    command.kill();
                })
                .on('error', err => callback(err))
                .on('finish', data => callback(null, data))
                .on('exit', data => callback(null, data));
        },
        // tag git branch
        (callback) => {
            console.info('Tagging git branch');

            const command = helpers.runCommand("git", ["tag", version]);

            command
                .stderr.on('data', data => {
                    console.error(data);
                    command.kill();
                })
                .on('error', err => callback(err))
                .on('finish', data => callback(null, data))
                .on('exit', data => callback(null, data));
        },
        // push tags
        (callback) => {
            console.info('Pushing git tag');

            const command = helpers.runCommand("git", ["push", "--tags"]);

            command
                .stderr.on('data', data => {
                    console.error(data);
                    command.kill();
                })
                .on('error', err => callback(err))
                .on('finish', data => callback(null, data))
                .on('exit', data => callback(null, data));
        },
        // npm publish
        (callback) => {
            console.info('Publishing to NPM');

            let publishArgs = ["publish"];
            if(!isRelease) publishArgs.push("--tag beta");

            const command = helpers.runCommand("npm", publishArgs);

            command
                .stderr.on('data', data => {
                    console.error(data);
                    command.kill();
                })
                .on('error', err => callback(err))
                .on('finish', data => callback(null, data))
                .on('exit', data => callback(null, data));
        }
    ], function(err, response) {
        cb(err, response);
    });
};
/**
 * @callback npmCallback
 * @param {String|Error} err
 * @param {String} response
 */

#!/usr/bin/env node
'use strict';

const program = require('commander');
const npm = require('./services/npm');
const colors = require('colors');

program
    .version('0.1.2')
    .command('npm-publish <name> <version>')
        .option('-p, --production [production]', 'set as production release')
        .action(function (name, version, options) {
            // Publish npm package
            npm.publish(name, version, !!options.production, (err, response) => {
                if(err) return console.error(colors.red(err));

                console.log(colors.green(`Congrats! Package: ${name} ${version} has been published.`));
            });
        });

program.parse(process.argv);

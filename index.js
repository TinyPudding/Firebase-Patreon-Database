// Base
const patreonModule = {};

// Start
patreonModule.start = function (data) {
    const express = require('firebase-webhook-express-default');
    patreonModule.app = express(async (req, res) => {

        // Lodash Module
        const _ = require('lodash');

        // Create Settings
        const tinyCfg = _.defaultsDeep({}, data.firebase, {
            options: {
                id: "main",
                autoStart: {
                    database: true
                }
            }
        });

        // Start Firebase
        try {

            const firebase = require('puddy-lib/firebase');
            if (tinyCfg.firebase) {
                firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);
            } else {
                firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);
            }

            // App
            const app = firebase.get(tinyCfg.options.id);

            // Check Domain
            let checkDomain = require('puddy-lib/http/check_domain');
            const theDomain = checkDomain.get(req);

            // Prepare HTTP Page
            const http_page = require('puddy-lib/http/HTTP-1.0');

            // Exist
            if (theDomain) {

                // Prepare Settings
                let patreon_database = null;

                // Default Domain
                if (typeof data.mainDomain === "string" && theDomain === data.mainDomain) {

                    // Get Settings
                    patreon_database = await firebase.getDBAsync(app.db.ref('patreon_settings').child('default'));
                    patreon_database = firebase.getDBValue(patreon_database);

                }

                // Custom Domain
                else if (theDomain !== "default") {

                    // Convert
                    theDomain = theDomain.replace(/\_/g, '').replace(/\./g, '_');

                    // Get Settings
                    patreon_database = await firebase.getDBAsync(app.db.ref('patreon_settings').child(firebase.databaseEscape(theDomain)));
                    patreon_database = firebase.getDBValue(patreon_database);

                }

                // The Final Action
                if (typeof patreon_database === "string" && patreon_database.length > 0) {
                    await require('./files/process')(req, res, app.db.ref(patreon_database), http_page, firebase, data.modules, _);
                    return;
                }

                // Nope
                else {
                    console.error('Invalid Domain!');
                    return http_page.send(res, 403);
                }

            }

            // Nope
            else {
                console.error('Domain not found!');
                return http_page.send(res, 404);
            }

        } 
        
        // Error
        catch (err) {
            console.error(err);
            console.error(err.message);
            return http_page.send(res, 500);
        }

    });
};

// Module
module.exports = patreonModule;
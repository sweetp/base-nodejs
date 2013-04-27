# Base package for Sweetp services developed with node.js

[![NPM version](https://badge.fury.io/js/sweetp-base.png)](http://badge.fury.io/js/sweetp-base)

Features:

* simple DSL to define service methods easily
* asynchronous callback API like node.js packages
* wire protocol abstracted for you, again, so you can write new services easily

# Example


    var service, methods, client, sweetp;

    sweetp = require('sweetp-base');

    // service methods with sweetp meta data
    service = {

        // add methods as properties of the service object, the key is used as target
        yourMethod:{
            // target:"/yourService/your/own/target/string/", /* optional! */
            options: {
                // description which params you need from sweetp
                params: {
                    // use URL to call other services
                    url: sweetp.PARAMETER_TYPES.url,
                    // define own parameters
                    myOwnParam: sweetp.PARAMETER_TYPES.one,
                    // or fetch config
                    config: sweetp.PARAMETER_TYPES.projectConfig
                },
                // add simple descriptions so everyone knows what this method does
                description: {
                    summary:"Get user and password for 'key'.",
                    example:"more fancy text here, you can use HTML here",
                    returns:"a string with text"
                }
            },
            // assign a function to the "fn" property, this gets executed when the service method gets called
            fn:function(err, params, callback) {
                if (err) return callback(err);

                // create unicorns here or any other fancy stuff which makes you more productive

                return callback(null, "This is your response and can be a String or JSON.");
            }
        },

    };

    // create service methods and start sweetp service (client)
    methods = sweetp.createMethods(service, '/yourService/');
    client = sweetp.start("YOUR SERVICE NAME", methods);

Put this in a file like `/somedir/foo.js`. Add this to your Sweetp `services.json` file:

    {
        "id":"example-node-service",
        "exec":[
            "node",
            "foo.js"
        ],
        "dir":"/somedir/"
    }

Now (re-)start Sweetp server and you should be able to call your example service with `http://localhost:7777/services/yourService/yourMethod` :-)

## Parameter types

See [JVM version](https://github.com/sweetp/base-groovy/blob/master/src/main/groovy/org/hoschi/sweetp/services/base/ServiceParameter.groovy) for more details.

    sweetp.PARAMETER_TYPES.url = "url";
    sweetp.PARAMETER_TYPES.one = "one";
    sweetp.PARAMETER_TYPES.projectConfig = "projectConfig";
    sweetp.PARAMETER_TYPES.list = "list";
    sweetp.PARAMETER_TYPES.request = "request";

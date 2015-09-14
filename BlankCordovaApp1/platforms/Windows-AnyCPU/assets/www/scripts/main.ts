/// <reference path="./typings/tsd.d.ts" />
requirejs.config({
    paths: {
        jquery: './jquery-2.1.4'
    }
});

// Directly call the RequireJS require() function and from here
// TypeScript's external module support takes over
require(["serverImplemented"]);
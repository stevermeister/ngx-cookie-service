#!/usr/bin/env node

const path = require('path');
const rimraf = require('rimraf');

rimraf( path.join( __dirname, '../dist-lib' ), function( err ) {
  if ( err ) {
    throw new Error( err );
  }
  console.log('Cleaned up after publishing, deleted `dist-lib`.');
});
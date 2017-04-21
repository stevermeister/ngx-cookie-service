#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const async = require('async');
const rimraf = require('rimraf');
const exec = require('child_process').exec;

console.log('Preparing ngx-cookie-service for `npm publish`...');

async.waterfall([
  deleteDistFolder,
  makeNewDistFolder,
  compileTypeScriptAndCreateDefinitionFile,
  copyPackageJson,
  copyNpmReadme
], function( err, result ) {
  if ( err ) {
    throw new Error( err );
  } else {
    console.log('Ready to publish!');
  }
});

function deleteDistFolder( next ) {
  rimraf( path.join( __dirname, '../dist-lib' ), function( err ) {
    if ( err ) {
      console.log('Could not delete `dist-lib`...');
      next( err );
    } else {
      console.log('Deleted `dist-lib`...');
      next( null );
    }
  });
}

function makeNewDistFolder( next ) {
  fs.mkdir( path.join( __dirname, '../dist-lib' ), function( err ) {
    if ( err ) {
      console.log('Could not create `dist-lib`...');
      next( err );
    } else {
      console.log('Created `dist-lib`...');
      next( null );
    }
  });
}

function compileTypeScriptAndCreateDefinitionFile( next ) {
  const cookieServicePath = path.join( __dirname, '../lib' );
  exec( 'tsc --declaration -p ' + cookieServicePath, function( err ) {
    if ( err ) {
      console.log('Failed to compile cookie service...');
      next( err );
    } else {
      console.log('Successfully compiled cookie service...');
      next( null );
    }
  });
}

function copyPackageJson( next ) {
  const packageJsonPath = path.join( __dirname, '../package.json' );
  const distLibPackageJsonPath = path.join( __dirname, '../dist-lib/package.json' );
  const source = fs.createReadStream( packageJsonPath );
  const dest = fs.createWriteStream( distLibPackageJsonPath );

  source.pipe( dest );
  source.on('error', function( err ) {
    console.log('Failed to copy package.json...');
    next( err );
  });
  source.on('end', function() {
    console.log('Successfully copied package.json...');
    next( null );
  });
}

function copyNpmReadme( next ) {
  const packageJsonPath = path.join( __dirname, '../README_NPM.md' );
  const distLibPackageJsonPath = path.join( __dirname, '../dist-lib/README.md' );
  const source = fs.createReadStream( packageJsonPath );
  const dest = fs.createWriteStream( distLibPackageJsonPath );

  source.pipe( dest );
  source.on('error', function( err ) {
    console.log('Failed to copy README_NPM.md...');
    next( err );
  });
  source.on('end', function() {
    console.log('Successfully copied README_NPM.md as README.md...');
    next( null );
  });
}

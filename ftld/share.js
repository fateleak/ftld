
const electron = require('electron');
const path = require('path');
const locale = require('./locale')

document.addEventListener('DOMContentLoaded', function () {
  console.log("share init")
  locale.init()

})
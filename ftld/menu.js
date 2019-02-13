
const electron = require('electron');
const path = require('path');
const locale = require('./locale')
const utils = require('./utils')
const moment = require('moment')

document.addEventListener('DOMContentLoaded', function () {
  console.log("init menu")
  locale.init()

})

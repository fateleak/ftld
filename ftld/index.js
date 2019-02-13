const electron = require('electron');
const path = require('path');
const locale = require('./locale')
const utils = require('./utils')
const moment = require('moment')
const { remote } = require('electron')
const { Menu, MenuItem } = remote
const Store = require('electron-store')
const store = new Store()
const urllib = require('url')
const fs = require('fs')
const databind = require('./databind')

if (utils.is_cn) {
  moment.locale('zh-cn')
}

document.addEventListener('DOMContentLoaded', function () {
  console.log("init window")
  locale.init()
  databind.autobind()

  $('#btn_execute').click(on_click_execute)
})

function open_win(win_name) {
  electron.ipcRenderer.send('open-win', win_name)
}

function on_click_execute() {
  console.log('exec')
}
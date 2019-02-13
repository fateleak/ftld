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
const whois = require('whois')

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

const ftld = require('./ftld')
function on_click_execute() {
  console.log('exec')

  let pre = $('#prefix_data').val()
  let post = $('#postfix_data').val()
  let tlds = $('#tld_data').val()
  pre = pre.split('\n')
  post = post.split('\n')
  tlds = tlds.split('\n')

  console.log(pre, post, tlds)
  pre.forEach(a => {
    post.forEach(b=>{
      tlds.forEach(c=>{
        let dm = `${a}${b}${c}`
        ftld.check_domain(dm, on_domain_result)
      })
    })
  });

}

function on_domain_result(is_avaliable, domain, whois) {
  
  let ele_text = `<span>${is_avaliable?'AA': 'NA'} ${domain}  ${whois?whois.substring(0, 20).trim():'empty'}
  </span>
  `
  if (is_avaliable) {
  $('#result_area').append($(ele_text))
  }
}
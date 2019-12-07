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
  $('#btn_swap').click(on_click_swap)

  setInterval(tick, 1000)


  $('#btn_gen_random').click(on_click_gen_random)
})

function open_win(win_name) {
  electron.ipcRenderer.send('open-win', win_name)
}

const ftld = require('./ftld')
let g_total_progress = 0
let g_current_progress = 0
let g_cache = store.get("cache", {})
console.log('cache=', g_cache)
function on_click_execute() {
  console.log('exec')

  let pre = $('#prefix_data').val()
  let post = $('#postfix_data').val()
  let tlds = $('#tld_data').val()
  pre = pre.split('\n')
  post = post.split('\n')
  tlds = tlds.split('\n')
  console.log(pre, post, tlds)
  $('#result_area').empty()

  let with_cache = $('#check_with_cache').prop('checked')
  if (!with_cache) {
    g_cache = {}
  }

  g_total_progress = 0
  g_current_progress = 0
  pre.forEach(a => {
    post.forEach(b=>{
      tlds.forEach(c=>{
        let dm = `${a}${b}${c}`
        if (dm in g_cache) {
          on_domain_result(g_cache[dm], dm, '', true)
        } else {
          ftld.check_domain(dm, on_domain_result)
          g_total_progress += 1
        }
      })
    })
  });
  refresh_progress()
}
function refresh_progress () {

  $('#msg').text(`${g_current_progress}/${g_total_progress}`)
}

function re_check(domain) {
  console.log(domain)
  ftld.check_domain(domain, on_domain_result)
  g_total_progress += 1
}

function on_domain_result(is_avaliable, domain, whois, is_cache=false) {
  
  let ele_text = `<div>${is_avaliable?'AA': 'NA'} 
  <a href="http://${domain}" target="_blank">${domain}</a> ${is_cache?'CACHE':'' } ${whois?whois.substring(0, 20).trim():''} 

  <button href="#" class="recheck">RE</button>
  </div>
  `
  if (!is_cache) {
    g_cache[domain] = is_avaliable
    store.set("cache", g_cache)
    g_current_progress += 1

    refresh_progress()
  }


  let show_na = $('#show_na').prop('checked')
  if (is_avaliable || show_na) {
    let ele = $(ele_text)
    ele.find('.recheck').click(re_check.bind(null, domain))
    $('#result_area').prepend(ele)
  }
}


function tick() {

}

function on_click_swap() {

  let pre = $('#prefix_data').val()
  let post = $('#postfix_data').val()


  $('#prefix_data').val(post)
  $('#postfix_data').val(pre)

  databind.triger('prefix_data')
  databind.triger('postfix_data')

}

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function on_click_gen_random() {
  console.log('gen')
  $('#random_list').empty()

  let len = parseInt($('#num_len').val())

  for(let i = 0; i < 3; i ++) {
    let word = randomString(len, 'abcdefghijklmnopqrstuvwxyz')

    $('#random_list').prepend(`
    <div class="item">
      ${word}.com
    </div>
    
    `)
  }
}
const electron = require('electron')
const { app, BrowserWindow, Menu, ipcMain, globalShortcut, crashReporter } = electron;
const utils = require('./utils')
const uuidgen = require('uuid/v4');
const main_utils = require('./main_utils')
const Store = require('electron-store')
const store = new Store()
const winmgr = require('./winmgr')

const path = require('path')
const url = require('url')


app.on('ready', function () {
  createMainWindow()
  const menu = Menu.buildFromTemplate(get_menu_template())
  Menu.setApplicationMenu(menu)
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // createMainWindow()
  BrowserWindow.getAllWindows()[0].show()
})


app.on('before-quit', () => {
  g_real_quit = true
  console.log("before quit")
})

app.on('will-quit', () => {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})


/* menu */
function lg(cn, en) {
  return app.getLocale() == 'zh-CN' ? cn : en;
}

function get_menu_template() {
  //locale在app ready之前，无法返回正确的值

  const menuTemplate = [
    {
      label: lg('文件', 'File'),
      submenu: [
        {
          label: lg('添加文件夹', 'Add Forder'),
          click() {
            main_utils.notify_all_windows('cmd-new-target')
          }
        },
        {
          label: lg('新建文件', 'New File'),
          accelerator: 'CmdOrCtrl+N',
          click() {
            main_utils.notify_all_windows('cmd-new-record')
          }
        },
        {
          label: lg('保存', 'Save'),
          accelerator: 'CmdOrCtrl+S',
          click() {
            main_utils.notify_all_windows('cmd-save')
          }
        },
        {
          label: lg('预览', 'Preview'),
          accelerator: 'CmdOrCtrl+/',
          click() {
            main_utils.notify_all_windows('cmd-preview')
          }
        }
      ]
    },
    {
      label: lg('编辑', 'Edit'),
      submenu: [
        { role: 'undo', label: lg('撤销', 'Undo') },
        { role: 'redo', label: lg('恢复', 'Redo') },
        { type: 'separator' },
        { role: 'cut', label: lg('剪切', 'Cut') },
        { role: 'copy', label: lg('复制', 'Copy') },
        { role: 'paste', label: lg('粘贴', 'Paste') },
        { role: 'selectall', label: lg('全选', 'Select All') },
        // { type: 'separator' },
        // {
        //   label: lg('加粗', 'Bold'),
        //   accelerator: 'CmdOrCtrl+B',
        //   click() {
        //     main_utils.notify_all_windows('cmd-bold')
        //   }
        // },
        // {
        //   label: lg('斜体', 'Italic'),
        //   accelerator: 'CmdOrCtrl+I',
        //   click() {
        //     main_utils.notify_all_windows('cmd-italic')
        //   }
        // },
        // {
        //   label: lg('行内代码', 'Inline Code'),
        //   accelerator: 'CmdOrCtrl+T',
        //   click() {
        //     main_utils.notify_all_windows('cmd-italic')
        //   }
        // }
      ]
    },
    {
      label: lg('查看', 'View'),
      submenu: [
        { role: 'zoomin', label: lg('放大', 'Zoom In') },
        { role: 'zoomout', label: lg('缩小', 'Zoom Out') },
        { role: 'resetzoom', label: lg('重置缩放', 'Reset Zoom') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: lg('切换全屏', 'Toggle Fun Screen') },
        // { label: 'Toggle Preview', accelerator: 'CommandOrControl+p',
        //   click(){  main_utils.notify_all_windows('cmd-toggle-preview') }}
      ]
    },
    {
      role: 'window',
      label: lg('窗口', 'Window'),
      submenu: [
        { role: 'minimize', label: lg('最小化', 'Minimize') },
        { role: 'close', label: lg('关闭', 'Close') }
      ]
    },
    {
      role: 'help',
      label: lg('帮助', 'Help'),
      submenu: [
        {
          label: lg('反馈', 'Feedback'),
          click() { require('electron').shell.openExternal('https://github.com/fateleak/mnote/issues') }
        },
        {
          label: lg('官方网站', "Check for updates"),
          click() { require('electron').shell.openExternal('http://mnote.netqon.com') }
        },
        { type: 'separator' },
        {
          label: lg('了解更多', 'Learn More'),
          click() { require('electron').shell.openExternal('http://netqon.com') }
        }
      ]
    }
  ]


  if (utils.is_mac()) {
    menuTemplate.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: lg('关于 Mnote', 'About Mnote') },
        { type: 'separator' },
        {
          label: lg('偏好设置', 'Preferences'),
          accelerator: 'CommandOrControl+,',
          click() { open_win('settings') }
        },
        { role: 'services', label: lg('服务', 'Services'), submenu: [] },
        { type: 'separator' },
        { role: 'hide', label: lg('隐藏 Mnote', 'Hide Mnote') },
        { role: 'hideothers', label: lg('隐藏其它', 'Hide Others') },
        { role: 'unhide', label: lg('显示全部', 'Show All') },
        { type: 'separator' },
        { role: 'quit', lable: lg('退出', 'Quit') }
      ]
    })

    // mac's Window menu
    menuTemplate[4].submenu = [
      { role: 'close', label: lg('关闭', 'Close') },
      { role: 'minimize', label: lg('最小化', 'Minimize') },
      { role: 'zoom', label: lg('缩放', 'Zoom') },
      { type: 'separator' },
      { role: 'front', label: lg('全部置于顶层', 'Bring All to Front') }
    ]
  } else {
    //For Win32, add settings and Exit
    menuTemplate[0].submenu.push(
      {
        label: lg('设置', 'Settings'),
        click() { open_win('settings') },
        accelerator: 'Ctrl+,'

      }
    )

    menuTemplate[0].submenu.push(
      { type: 'separator' }
    )
    menuTemplate[0].submenu.push(
      {
        role: 'quit',
        label: lg('退出', 'Exit'),
        accelerator: 'Ctrl+q'
      }
    )

    menuTemplate[4].submenu.unshift(
      {
        role: 'about',
        label: lg('关于 Mnote', 'About Mnote'),
        click() { open_win('about') }
      }
    )
  }

  if (utils.is_dev) {
    menuTemplate.push({
      label: 'Dev',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        {
          label: 'test crash',
          click() { process.crash() }
        },
        {
          label: 'relaunch',
          click() {
            app.relaunch()
            app.exit(0)
          }
        },
        {
          label: 'devwin',
          click() {
            openDevWindow()
          }
        }
      ]
    })
  }

  return menuTemplate
}

let mainWindow
let g_real_quit = false

function createMainWindow() {

  if (mainWindow == null) {

    mainWindow = new BrowserWindow({
      webPreferences: { webSecurity: true },
      width: store.get('width', 1400),
      height: store.get('height', 600),
      // titleBarStyle: 'hidden'
    })

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    mainWindow.webContents.on('new-window', function (event, url) {
      event.preventDefault();
      electron.shell.openExternal(url)
    })
    mainWindow.on('close', function (event) {
      //不关闭主窗口，而是用隐藏代替，使得重新打开的时候秒开
      if (!g_real_quit) {
        event.preventDefault()
        mainWindow.hide()
        if (utils.is_mac()) {
          app.dock.hide() //dock图标随主窗口关闭
        }
      }
    })

    mainWindow.on('closed', function () {
      mainWindow = null
      if (utils.is_mac()) {
        app.dock.hide() //dock图标随主窗口关闭
      }
    })

    mainWindow.on('show', (event) => {
      if (utils.is_mac()) {
        app.dock.show() //dock图标随主窗口关闭
      }
    })

  } else {
    mainWindow.show()
  }
}

ipcMain.on('open-main-window', function (e, data) {
  createMainWindow()
})

let g_win_wh = {
  default:[300,600],
  settings: [300, 600],
  mdg_demo: [800, 800]
}

ipcMain.on('open-win', function (e, win_name) {
  open_win(win_name);
})

function open_win(win_name) {
  let wh = g_win_wh[win_name];
  if (!wh) {
    wh = g_win_wh.default;
  }
  return winmgr.open_win(win_name, wh[0], wh[1])
}

ipcMain.on('databind-change', function (e, data) {
  main_utils.notify_all_windows('databind-change', data);
})

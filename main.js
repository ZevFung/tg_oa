// Modules to control application life and create native browser window
const electron = require('electron')
const { app, BrowserWindow } = require('electron')

const path = require('path')
const url = require('url')
// 爬虫
const superagent = require('superagent');
// 操作文件
const fs = require('fs-extra');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// 验证码的cookie
var codeCookie
// 验证码网址
const codeUrl = 'http://www.zjsgat.gov.cn:8080/was/Kaptcha.jpg?15';
// 头信息
const browserMsg = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
};

const ipcMain = electron.ipcMain;
ipcMain.on('notice', (e, msg) => {
  switch (msg) {
    case 'getcodeCookie':
      mainWindow.webContents.send('codeCookie', codeCookie)
      break
    default:
      break
  }
})

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })
  superagent
    .get(codeUrl)
    .set(browserMsg)
    .end((err, res) => {
      codeCookie = res.header['set-cookie']
      console.log('codeCookie: ' + codeCookie)
      // 验证码图片保存到本地
      fs.outputFile(path.join(__dirname) + '/code.png', res.body, function (err) { })
    })
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // 打开调试控制台
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

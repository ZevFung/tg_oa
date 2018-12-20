const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const path = require('path');
const superagent = require('superagent');

// 链接
const urls = {
    loginUrl: "oa.tgnet.com/Account/Login",
    codeUrl: "验证码地址",
    targetUrl: "后台的地址"
};

// 头信息
const browserMsg = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36",
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
};
// 验证码cookie
var codeCookie;
// 登录后的cookie
var tokenCookie;

// 获取控件
const btn_submit = document.getElementById("btn_submit");
const btn_refresh = document.getElementById("btn_refresh");
const input_name = document.getElementById("input_name");
const input_pass = document.getElementById("input_pass");
const input_code = document.getElementById("input_code");

// 登录按钮 点击事件
btn_submit.addEventListener('click', (e) => {
    ipcRenderer.send('notice', 'getcodeCookie');
    // 获取输入文本
    var name = input_name.value;
    var pass = input_pass.value;
    var code = input_check.value;
    // 校验输入
    if (name == "" || pass == "" || code == "") {
        alert("请输入");
    } else {
        // 校验通过 开始进行登录操作
        superagent
            .post(urls.loginUrl)
            .set('Cookie', codeCookie)
            .set(browserMsg)
            // 避免登录后的302重定向
            .redirects(0)
            .send({
                'LoginForm[username]': name
            }).send({
                'LoginForm[password]': pass
            }).send({
                logincode: code
            }).send({
                jz: '0'
            }).end((err, res) => {
                // 登录成功 获取tokenCookie
                // 获取tokenCookie
                tokenCookie = res.header['set-cookie'];
                superagent
                    .get(urls.targetUrl)
                    .set('Cookie', tokenCookie)
                    .set(browserMsg)
                    .end((err, res) => {
                        // 成功进入后台
                        console.log(res.text);
                    })
            });
    }

});

btn_refresh.addEventListener('click', (e) => {

});

ipcRenderer.on('codeCookie', (e, msg) => {
    codeCookie = msg;
    console.log('接受主进程发送的codeCookie: ' + codeCookie);
});
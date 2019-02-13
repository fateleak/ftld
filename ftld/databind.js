const electron = require('electron')
const Store = require('electron-store')
const store = new Store()

//自动绑定设置项到数据存储
//          <select class="form-control autobind" id="file_sort_method" dft="create">

exports.autobind = ()=>{
    $('.autobind').each((index, element)=>{
        console.log(element)
        jele = $(element);
        let name = element.id;
        let cur_val = store.get(name, element.getAttribute('dft'));
        if (cur_val == 'ture') {
            cur_val = true
        }
        if (cur_val == 'false') {
            cur_val = false
        }
        element.value = cur_val
        console.log('bind init', name, cur_val)
        if (jele.attr('type') == 'checkbox') {
            jele.prop('checked', cur_val)
        }
        jele.change((event)=>{
            on_change(event.target.id);
        })
    })
}

function on_change(name) {
    let jele = $('#'+name);
    let new_value = jele.val()
    if (jele.attr('type') == 'checkbox') {
        new_value = jele.prop('checked')
    }
    store.set(name, new_value);
    console.log('bind change', name, new_value)
    electron.ipcRenderer.send('databind-change', name);
}


exports.triger = (name)=>{
    on_change(name);
}
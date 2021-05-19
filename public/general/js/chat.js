/*jslint browser: true*/
/*global console, alert, $, jQuery*/

let socket = io("/chat")
let opened
let sender = $('#uid').val()


startChatInterFace()



socket.on("chat-ready", (data) => {
    opened = data.chatId
    $('li.active').attr('data-cid', opened)
    $('#messages').empty()
    updateLocalStorage(opened)

    data.conversion.forEach(c => this.renderNewMsg(c))
    scrolltoBtm()
});

socket.on("typing", (chat) => {
    if (chat == opened) {
        $('#typing').removeClass('none')
    }
});
socket.on("stoptyping", (chat) => {
    if (chat == opened) {
        $('#typing').addClass('none')
    }
});

socket.on("new-message", data => {
    console.log('Got new message!!');
    getNewMsg(data)
});
socket.on("online", data => {
    this.onlineusers = data
});
socket.on("offline", data => {
    // this.info.push({ name: data, type: "offline" });
});
window.onbeforeunload = () => {
    socket.emit("offline", this.name);
};


function startChatInterFace() {
    const path = window.location.pathname

    socket.emit("join-chats", {});
    const msgsNo = getAndSetUnreadMsgsNo(false)
    if (path !== '/admin/chat' && path !== '/driver/chat') {
        menuChatIcon(msgsNo)
    } else {
        $('.admin').on('click', this.startchat.bind(this))
        $('#send-group-msg-from').on('submit', this.sendMessage.bind(this))
        $('#group-msg').on('keyup', this.typing.bind(this))
        displayChatsIcon()
    }

}


function startchat(e) {
    $('li.active').removeClass('active')

    socket.emit("disconnecting", opened);
    let adminId = $(e.currentTarget).data('aid')
    let driverId = $(e.currentTarget).data('did')
    let chatId = $(e.currentTarget).data('cid') || null
    const choosen = $(e.currentTarget).data('n')
    $('.box-header h3').html(choosen)
    socket.emit("register", { adminId, chatId, driverId });
    $(e.currentTarget).addClass('active')
    $('.chating').removeClass('none')
}
function updateLocalStorage(id) {
    const item = localStorage.getItem(`${id}`)
    if (item) {
        let unreadMsgsNo = localStorage.getItem('unreadMsgsNo')
        if (!unreadMsgsNo || unreadMsgsNo == 'NaN') {
            unreadMsgsNo = 0
        }
        let newNo = parseInt(unreadMsgsNo, 10) - parseInt(item, 10)
        localStorage.setItem('unreadMsgsNo', newNo)
        localStorage.removeItem(`${id}`)
        displayChatsIcon()
    }
}
function typing(e) {
    if (opened) {
        let msg = $(e.target).val().replace(/\s/g, '').length
        if (msg) {
            socket.emit('typing', opened)
        } else {
            socket.emit('stoptyping', opened)
        }
    }
}
function sendMessage(e) {
    e.preventDefault()
    if (opened) {
        let message = $('#group-msg').val()
        if (message.replace(/\s/g, '').length) {
            let newd = new Date()
            let date = { date: newd.toLocaleDateString(), time: newd.getHours() + ':' + newd.getMinutes() }
            let msg = { chatId: opened, msg: message, type: 0, date: date, sender: sender }

            socket.emit("message", msg);
            renderNewMsg(msg)
            scrolltoBtm()
            $('#group-msg').val('')
            socket.emit('stoptyping', opened)
        }
    }

}


function getNewMsg(data) {
    const path = window.location.pathname
    if (path != '/admin/chat' && path != '/driver/chat') {
        const msgsNo = getAndSetUnreadMsgsNo(true)
        menuChatIcon(msgsNo)
        localStorage.setItem(`${data.chatId}`, msgsNo)
        showSnackbar()
    } else {
        if (data.chatId !== opened) {
            getAndSetUnreadMsgsNo(true)
            let oldNo = parseInt(localStorage.getItem(`${data.chatId}`), 10) || 0
            localStorage.setItem(`${data.chatId}`, (oldNo + 1))
            displayChatsIcon()
        } else {
            this.renderNewMsg(data)
            scrolltoBtm()
        }

    }
}
function menuChatIcon(msgsNo) {
    $('.dashboard-menu_item .new-chats-no').html(msgsNo).removeClass('none')
}

function getAndSetUnreadMsgsNo(newmsg) {
    let unreadMsgsNo = localStorage.getItem('unreadMsgsNo')
    if (!unreadMsgsNo || unreadMsgsNo == "NaN") {
        unreadMsgsNo = 0
    }
    let newMsgsNo = newmsg ? parseInt(unreadMsgsNo, 10) + 1 : parseInt(unreadMsgsNo, 10)
    localStorage.setItem("unreadMsgsNo", newMsgsNo)
    return newMsgsNo

}

function displayChatsIcon() {
    const items = { ...localStorage };
    delete items.unreadMsgsNo
    $('.new-chats-no').html('0').addClass('none')

    console.log(items);
    if (items != {}) {
        $('.admin').each(function () {
            let id = $(this).data('cid')
            console.log(Object.keys(items));
            if (!Object.keys(items).includes(id)) {
                $(this).find('.new-chats-no').html(items[id]).removeClass('none')
            }
        })
    }

}

function showSnackbar() {
    var x = document.getElementById("snackbar");
    x.className = "show";
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 6000);
}


function renderNewMsg(data) {
    $('#messages ').append(`<li class="type-${data.sender == sender ? '1' : '0'}">${data.msg}  <small>${data.date.time}</small> </li>`)
}
function scrolltoBtm() {
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

let selectedFile = null
let FReader;
let Fname;


$('#imageInput').on('change', function () {
    if ($(this).val().length > 0) {

        fileReader = new FileReader();
        fileReader.onload = function (data) {
            $('.image-preview').attr('src', data.target.result);
            selectedFile = $(this).prop('files')[0];
            console.log(selectedFile);
        }
        fileReader.readAsDataURL($(this).prop('files')[0]);


        $('.image-preview-wrapper').removeClass('none')
        $('.change-image').css('display', 'block');

    }
});


$('.change-image').on('click', function () {
    $control = $(this);
    $('#imageInput').val('');
    $preview = $('.image-preview');
    $preview.attr('src', '');

    $('.image-preview-wrapper').addClass('none')

    $control.css('display', 'none');
});



this.socket.on('MoreData', function (data) {

    let per = Math.floor(data['Percent'])
    UpdateBar(per);
    var Place = data['Place'] * 524288; //The Next Blocks Starting Position
    let NewFile; //The Variable that will hold the new Block of Data
    if (selectedFile.webkitSlice)
        NewFile = selectedFile.webkitSlice(Place, Place + Math.min(524288, (selectedFile.size - Place)));
    else
        NewFile = selectedFile.slice(Place, Place + Math.min(524288, (selectedFile.size - Place)));

    FReader.readAsBinaryString(NewFile);
});
socket.on('Done', function (data) {
    $('#cancelButton').addClass('none')
    submitVideo(data)
});


function StartUpload(e) {

    if (document.getElementById('FileBox').value != "") {
        $('#UploadButton').off('click');
        // console.log('upload started');

        FReader = new FileReader();
        Fname = 'image' + new Date.toLocaleDateString()
        // var Content = "<span id='NameArea'>Uploading " + videos.selectedFile.name + " as " + videos.Name + "</span>";

        FReader.onload = function (evnt) {
            socket.emit('upload', { 'Name': Fname, Data: evnt.target.result });
        }
        socket.emit('start-upload', { 'Name': Fname, 'Size': selectedFile.size });

    }
    else {
        alert("Please Select A File");
    }
}
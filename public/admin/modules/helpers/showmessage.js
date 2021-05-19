function showmessage(message, messageType, selector) {
    $(selector).prepend(`<p class="message alert alert-${messageType}"> <i class="fas fa-times c-w closemessage m-medium"></i> ${message}</p>`)
    $('.message').animate({ top: '80px' }, 200)
    setTimeout(function () { $('.message').animate({ top: '0' }, 100, function () { $(this).remove() }) }, 9000);
}


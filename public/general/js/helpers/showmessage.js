function showmessage(message, messageType, selector) {
    $(selector).prepend(`<p class="message alert alert-${messageType}">${message}</p>`)
    $('.message').animate({ top: '80px' }, 200)
    setTimeout(function () { $('.message').animate({ top: '0' }, 100, function () { $(this).remove() }) }, 4000);
}
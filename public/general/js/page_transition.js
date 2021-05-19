
window.addEventListener("click", function (e) {
    e.preventDefault()
    const link = e.currentTarget.document.activeElement
    const check = isLink(link)
    if (check) {
        const newPath = getHref(link)
        if (newPath) {
            const currentPath = window.location.pathname
            if (check) startTransition(link, newPath, currentPath, e)
        }
    }

});


function getHref(e) { return e.getAttribute('href') }

function isLink(element) {
    if (element.tagName === 'a' || element.tagName === 'A') return true
    else return false
}


async function startTransition(link, newPath, currentPath, e) {
    const currentPage = document.getElementById('main')
    currentPage.style.opacity = 0;

    const text = await getNextPage(newPath)
    if (text != false) {
        const nextPageHtml = strToHtml(text)
        const nextPage = nextPageHtml.querySelector('#main')
        const res = checkMainElements(nextPageHtml)
        if (res) {
            return replacePages(currentPage, nextPage, newPath, currentPath)
        } else {
            return window.location = newPath
        }
    } else {
        currentPage.style.opacity = 0;
    }


}

function strToHtml(text) {
    var dom = document.createElement('div');
    dom.innerHTML = text;
    return dom
}

function checkMainElements(nextPageHtml) {
    const currentPage = document.getElementById('main')
    const nextPage = nextPageHtml.querySelector('#main')
    if (!currentPage || !nextPage) return false
    return true
}

async function getNextPage(url) {
    try {
        const res = await fetch(url, { method: 'get' })

        if (res.status == 200) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("text/html") === -1) {
                return false
            }
            return await res.text()

        } else {
            showmessage(json.message, json.messageType, 'body')
            return null
        }
    } catch (error) {
        showmessage(error, 'warning', 'body')
    }
}


function replacePages(currentPage, nextPage, newPath, currentPath) {

    window.history.pushState("", "", newPath);

    currentPage.innerHTML = nextPage.innerHTML
    reload_css()
    reload_js();
    setTimeout(() => {
        scrollTopFunction()
        document.getElementById('main').style.opacity = 1;

    }, 500);


}




function reload_js() {
    var body = document.querySelector('body')

    var scripts = document.querySelectorAll("script[data-reload='true']")
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].getAttribute('src')
        var newscript = document.createElement('script');
        newscript.src = src;
        newscript.setAttribute('data-reload', 'true')
        body.appendChild(newscript);
        scripts[i].remove()

    }
}
function reload_css() {
    var head = document.querySelector('head')

    var links = document.querySelectorAll("link[data-reload='true']")
    for (let i = 0; i < links.length; i++) {
        const href = links[i].getAttribute('href')
        var newLink = document.createElement('link');

        newLink.href = href;
        newLink.setAttribute('data-reload', 'true')
        newLink.setAttribute('rel', 'stylesheet')
        head.appendChild(newLink);
        links[i].remove()

    }
}

function animatePage(transition) {

}



function scrollTopFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
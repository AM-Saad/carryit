async function fetchdata(token, url, method, body, contentType) {
    let res
    try {
        if (contentType) {
            if (method === 'post' || method === 'put') {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'X-CSRF-Token': token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: body
                })
            } else {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'X-CSRF-Token': token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
            }

        } else {

            if (method === 'post' || method === 'put') {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'X-CSRF-Token': token
                    },
                    body: body
                })
            } else {
                res = await fetch(url, {
                    method: method,
                    headers: {
                        'X-CSRF-Token': token
                    }
                })
            }
        }
        const json = await res.json()
        if (res.status == 200 || res.json.status == 201) {
            return { res, json }
        } else {
            showmessage(json.message, json.messageType, 'body')
            return null
        }
    } catch (error) {
        showmessage(error, 'warning', 'body')
        return null
    }
}
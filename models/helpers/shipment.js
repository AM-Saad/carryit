
exports.validateShipment = (pickup, receiver, price, quantity, pickup_date, delivery_date) => {

    if (checkItem(pickup, 'object')) return { state: false, reason: 'Pickup' + checkItem(pickup, 'object') }
    if (checkItem(receiver, 'object')) return { state: false, reason: 'Receiver' + checkItem(receiver, 'object') }
    if (checkItem(price, 'number')) return { state: false, reason: 'Price' + checkItem(price, 'number') }
    if (checkItem(quantity, 'number')) return { state: false, reason: 'Quantity' + checkItem(quantity, 'number') }
    if (checkItem(pickup_date, 'string')) return { state: false, reason: 'Pickup Date' + checkItem(pickup_date, 'string') }
    if (checkItem(delivery_date, 'string')) return { state: false, reason: 'Delivery Date' + checkItem(delivery_date, 'string') }


    if (checkItem(receiver.name, 'string')) return { state: false, reason: 'Receiver Name' + checkItem(receiver.name, 'string') }
    if (checkItem(receiver.phone, 'string')) return { state: false, reason: 'Receiver Phone' + checkItem(receiver.phone, 'string') }
    if (checkItem(receiver.address, 'string')) return { state: false, reason: 'Receiver Address' + checkItem(receiver.address, 'string') }

    if (checkItem(pickup.name, 'string')) return { state: false, reason: 'Pickup Name' + checkItem(pickup.name, 'string') }
    if (checkItem(pickup.phone, 'string')) return { state: false, reason: 'Pickup Phone' + checkItem(pickup.phone, 'string') }
    if (checkItem(pickup.address, 'string')) return { state: false, reason: 'Pickup Address' + checkItem(pickup.address, 'string') }

    return { state: true }
}

function checkItem(item, itemtype) {
    if (!item) return ' Not Found'
    if (typeof item !== itemtype) return ' Not Has Correct Type'
}
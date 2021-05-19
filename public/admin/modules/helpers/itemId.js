function findItemId(itemType, e) {
    console.log(itemType);
    
    let id
    if ($(e.target).hasClass('content-item')) {
        id = e.target.querySelector(`input[name="${itemType}"]`).value
    } else if ($(e.target).hasClass('sub-menu_item')) {
        id = $(e.target).parents('.content-item').find(`input[name="${itemType}"]`).val()
    } else if ($(e.target).hasClass('single-item_actions')) {
        id = $(e.target).parents('.single-item').find(`input[name="${itemType}"]`).val()
    } else {
        id = $(e.target).parents('.content-item').find(`input[name="${itemType}"]`).val()
    }
    return id
}
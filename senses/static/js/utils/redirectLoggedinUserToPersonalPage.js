"use strict"

async function redirectNavProfileBtnHrefToPersonal(currentUserName){

    const toUserPageBtn = document.querySelectorAll('.navProfileBtn')

    toUserPageBtn.forEach(btn=>{
        btn.setAttribute('href', `/user/profile/${currentUserName}`)
    })

}

async function redirectWhileLoadingForbiddenPage(currentUserName){

    const currentPage = window.location.href
    const profileEntryPage = 'http://127.0.0.1:8000/user/profile/'
    const loginPage = 'http://127.0.0.1:8000/user/login/'

    if(currentPage === profileEntryPage || currentPage === loginPage){
        window.location.replace(`/user/profile/${currentUserName}`);
    }

}
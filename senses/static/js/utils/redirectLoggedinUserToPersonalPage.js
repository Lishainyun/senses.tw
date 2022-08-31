"use strict"

async function redirectNavProfileBtnHrefToPersonal(currentUserName){

    const toUserPageBtn = document.querySelectorAll('.navProfileBtn')

    toUserPageBtn.forEach(btn=>{
        btn.setAttribute('href', `/user/profile/${currentUserName}`)
    })

}

async function redirectWhileLoadingForbiddenPage(currentUserName){

    const currentPage = window.location.href
    const profileEntryPage = '/user/profile/'
    const loginPage = '/user/login/'

    if(currentPage === profileEntryPage || currentPage === loginPage){
        window.location.replace(`/user/profile/${currentUserName}`);
    }

}
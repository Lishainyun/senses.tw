"use strict"

async function checkUserStatus(){

    const token = localStorage.getItem('token')

    if(token){

        displayStatusOn()
        displayTopNavbar()

        const data = {
            "status": "isAuthenticated",
            "token": token,
        }

        return data
    } else {

        displayStatusOff()
        displayTopNavbar()

        const data = {
            "status": "isAnonymous",
            "token": null,
        }

        return data
    }
}

async function displayTopNavbar(){
    const topNavbar = document.querySelector('.top-navbar')
    topNavbar.style.display = 'block'
}

async function displayStatusOff(){

    const onStatus = document.querySelectorAll('.status-on')
    onStatus.forEach(ele=>{
        ele.style.display = 'none'
    })

    const offStatus = document.querySelectorAll('.status-off')
    offStatus.forEach(ele=>{
        ele.style.display = 'block'
    })

}

async function displayStatusOn(){

    const offStatus = document.querySelectorAll('.status-off')
    offStatus.forEach(ele=>{
        ele.style.display = 'none'
    })

    const onStatus = document.querySelectorAll('.status-on')
    onStatus.forEach(ele=>{
        ele.style.display = 'block'
    })
}
"use strict"

async function checkUserStatus(){

    const token = localStorage.getItem('token')

    if(token){

        const data = {
            "status": "isAuthenticated",
            "token": token,
        }

        return data
    } else {

        const data = {
            "status": "isAnonymous",
            "token": null,
        }

        return data
    }
}
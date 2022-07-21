"use strict"

class Comment{

    commentListApiUrl = 'http://127.0.0.1:8000/api/stories/'
    commentApiUrl = 'http://127.0.0.1:8000/api/story/'

    constructor(currentUserName){
        this.currentUserName = currentUserName
    }

    async 

    async createComment(){
        const response = await fetch(this.commentApiUrl)
    }

    async clickLike(){

    }

}

const comment = new Comment(currentUserName)

const commentErrorMessageBlock = (event) => {
    const errorMessageBlock = `<div class="error-message-block">
                                    <h>您尚未登入</h><span class="fadein-block-close">X</span>
                                    <div>
                                        <span>註冊</span><span>登入</span>
                                    </div>
                               </div>`
    const insertedHtml = event.target.parentNode.parentNode
    console.log(insertedHtml)
    insertedHtml.insertAdjacentHTML('afterend', errorMessageBlock)

    // activate close button
    const fadeinBlockClose = document.querySelectorAll('.fadein-block-close')
    fadeinBlockClose.forEach(closebtn=>{
        fadeinBlockCloseEle.push(closebtn)
    })
}


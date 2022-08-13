"use strict"
const loaderWrapper = `<div class="loader-wrapper"></div>`
const storiesLoader = `<div class="render-stories-wrap loader">
                            <div class="stories-avatar loader"></div>
                            <div class="stories-username loader"></div>
                            <div class="stories-time loader"></div>
                            <div class="stories-text loader-1"></div>
                            <div class="stories-text loader-2"></div>
                            <div class="stories-text loader-3"></div>
                        </div>`

const commentsLoader = `<div class="render-comments-wrap loader">
                            <div class="comments-avatar loader"></div>
                            <div class="comments-username loader"></div>
                            <div class="comments-time loader"></div>
                            <div class="comments-text loader-1"></div>
                            <div class="comments-text loader-2"></div>
                            <div class="comments-text loader-3"></div>
                        </div>`

let idCommentsNumPair = {}
let storyLoaderDisplayCount = 0;

function displayLoader(triggeredEventEle, triggeredEventClassName){

    if(!triggeredEventClassName){

        const layout = document.querySelector('.stories-block')
    
        if(storyLoaderDisplayCount === 0){
    
            layout.insertAdjacentHTML('beforebegin', loaderWrapper)
    
            let loaderWrapperEle = document.querySelectorAll('.loader-wrapper')
            loaderWrapperEle.forEach(ele=>{
                for(let i = 0; i < 6; i++){
                    ele.insertAdjacentHTML('afterbegin', storiesLoader)
                }
            })

            storyLoaderDisplayCount += 1
    
        } else {
            
            layout.insertAdjacentHTML('beforeend', loaderWrapper)
    
            let latestLoaderWrapperEle = [...document.querySelectorAll('.loader-wrapper')].pop()
            latestLoaderWrapperEle.insertAdjacentHTML('afterbegin', storiesLoader)
    
        }
    
    } else {

        if(triggeredEventClassName === 'stories-click-comment'){
            const insertedEle = triggeredEventEle.parentNode
            const commentsNum = parseInt(insertedEle.previousElementSibling.dataset.commentsnum)
            const storyId = insertedEle.previousElementSibling.dataset.storyid
            idCommentsNumPair.storyId = commentsNum

            if(idCommentsNumPair.storyId < 12){

                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < commentsNum; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId = ""

            } else {
                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < 12; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId -= 12

            }

        } else if(triggeredEventClassName === 'comment-nums') {
            const insertedEle = triggeredEventEle.parentNode.lastElementChild.previousElementSibling
            const commentsNum = parseInt(insertedEle.dataset.commentsnum)
            const storyId = insertedEle.dataset.storyid
            idCommentsNumPair.storyId = commentsNum

            if(commentsNum < 12){

                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < commentsNum; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId = ""

            } else {
                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < 12; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId -= 12

            }
        } else if (triggeredEventClassName === 'more-button'){
            const insertedEle = triggeredEventEle.parentNode
            const storyId = triggeredEventEle.dataset.storyid
            const displayCommentsDataUtils = storyId.concat('', '-displayComments')
            const commentsNum = parseInt(document.querySelector(`[data-utils='${displayCommentsDataUtils}']`).dataset.commentsnum)

            idCommentsNumPair.storyId = commentsNum

            if(idCommentsNumPair.storyId < 12){

                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < commentsNum; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId = ""

            } else {
                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < 12; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId -= 12

            }


        } else if (triggeredEventClassName === 'comment-comments'){
            const insertedEle = triggeredEventEle
            const commentId = triggeredEventEle.dataset.commentid
            const commentsNum = parseInt(triggeredEventEle.dataset.commentsnum)
            idCommentsNumPair.commentId = commentsNum

            if(commentsNum < 12){

                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < commentsNum; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId = ""

            } else {
                insertedEle.insertAdjacentHTML('beforebegin', loaderWrapper)

                let loaderWrapperEle = document.querySelector('.loader-wrapper')
                for(let i = 0; i < 12; i++){
                    loaderWrapperEle.insertAdjacentHTML('afterbegin', commentsLoader)
                }

                idCommentsNumPair.storyId -= 12

            }
        }

    }

}

function closeLoader(){
    const loaderWrapperEle = document.querySelectorAll('.loader-wrapper')
    loaderWrapperEle.forEach(ele=>{
        ele.remove()
    })

}

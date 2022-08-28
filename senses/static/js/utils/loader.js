"use strict"
const loaderWrapper = `<div class="loader-wrapper"></div>`
const storiesLoader = `<div class="render-stories-wrap-loader">
                            <div class="stories-avatar-loader"></div>
                            <div class="stories-username-loader"></div>
                            <div class="stories-time-loader"></div>
                            <div class="stories-text-loader-1"></div>
                            <div class="stories-text-loader-2"></div>
                            <div class="stories-text-loader-3"></div>
                        </div>`

const commentsLoader = `<div class="render-comments-wrap loader">
                            <div class="comments-avatar loader"></div>
                            <div class="comments-username loader"></div>
                            <div class="comments-time loader"></div>
                            <div class="comments-text loader-1"></div>
                            <div class="comments-text loader-2"></div>
                            <div class="comments-text loader-3"></div>
                        </div>`

const profileLoaderWrapper = `<div class="profile-loader-wrapper"></div>`
const profileLoader = `<div class="profile loader">
                            <div class="profile-bg loader"></div>
                            <div class="profile-avatar loader"></div>
                            <div class="profile-username loader"></div>
                            <div class="profile-intro loader"></div>
                            <div class="editprofile-logout-block loader"></div>
                      </div>`

const infoLoaderWrapper = `<div class="infoblock-loader-wrapper"></div>`
const infoLoader = `<div class="infoblock loader">
                            <div class="infoblock-avatar loader"></div>
                            <div class="infoblock-username loader"></div>
                            <div class="infoblock-time loader"></div>
                            <div class="infoblock-message loader"></div>
                        </div>`

const profileInfoLoaderWrapper = `<div class="profile-infoblock-loader-wrapper"></div>`
const profileInfoLoader = `<div class="profile-infoblock loader">
                            <div class="profile-infoblock-avatar loader"></div>
                            <div class="profile-infoblock-username loader"></div>
                            <div class="profile-infoblock-time loader"></div>
                            <div class="profile-infoblock-message loader"></div>
                        </div>`    

let idCommentsNumPair = {}
let storyLoaderDisplayCount = 0;
let storyLoaderRenderCount = 0
let infoblockLoaderRenderCount = 0

function displayLoader(triggeredEventEle, triggeredEventClassName){

    if(!triggeredEventClassName){

        if(currentPathnameSplitted[2] === 'profile'){

            renderStoriesLoader('profile')

            if(infoblockLoaderRenderCount === 0){
                renderProfileLoader()
                renderInfoLoader('profile')
                infoblockLoaderRenderCount++
            }

        } else {

            renderStoriesLoader()

            if(infoblockLoaderRenderCount === 0){
                renderInfoLoader()
                infoblockLoaderRenderCount++
            }

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

function renderInfoLoader(location){

    if(location === 'profile'){
        const storyLoaderWrapper = document.querySelector('.loader-wrapper') 
        storyLoaderWrapper.insertAdjacentHTML('afterbegin', profileInfoLoaderWrapper)

        for(let i = 0; i < 4; i++){
            document.querySelector('.profile-infoblock-loader-wrapper').insertAdjacentHTML('afterbegin', profileInfoLoader)    
        }

    }else{

        const storyLoaderWrapper = document.querySelector('.loader-wrapper') 
        storyLoaderWrapper.insertAdjacentHTML('beforebegin', infoLoaderWrapper)

        for(let i = 0; i < 4; i++){
            document.querySelector('.infoblock-loader-wrapper').insertAdjacentHTML('afterbegin', infoLoader)  

        }

    }

}


function renderProfileLoader(){

    const insertedEle = document.querySelector('.loader-wrapper')
    insertedEle.insertAdjacentHTML('afterbegin', profileLoaderWrapper)

    let loaderWrapperEle = document.querySelector('.profile-loader-wrapper')
    loaderWrapperEle.insertAdjacentHTML('afterbegin', profileLoader)

}

function renderStoriesLoader(location){

    const layout = document.querySelector('.stories-block')
    
    if(location && location === 'profile' && window.innerWidth > 1200){
        if(storyLoaderDisplayCount === 0){

            layout.insertAdjacentHTML('beforebegin', loaderWrapper)

            let loaderWrapperEle = document.querySelectorAll('.loader-wrapper')
            loaderWrapperEle.forEach(ele=>{
                for(let i = 0; i < 6; i++){
                    ele.insertAdjacentHTML('afterbegin', storiesLoader)
                }
            })

            if(storyLoaderRenderCount === 0){
                document.querySelectorAll('.render-stories-wrap-loader').forEach(ele=>{
                    ele.style.width = '60%'
                })
                storyLoaderRenderCount++
            } 

            storyLoaderDisplayCount += 1

        } else {
            
            layout.insertAdjacentHTML('beforeend', loaderWrapper)

            let latestLoaderWrapperEle = [...document.querySelectorAll('.loader-wrapper')].pop()
            latestLoaderWrapperEle.insertAdjacentHTML('afterbegin', storiesLoader)

            if(storyLoaderRenderCount === 0){
                document.querySelectorAll('.render-stories-wrap-loader').forEach(ele=>{
                    ele.style.width = '60%'
                })
                storyLoaderRenderCount++
            } 

        }
    } else {
        if(storyLoaderDisplayCount === 0){

            layout.insertAdjacentHTML('afterbegin', loaderWrapper)

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
    }

}

function closeLoader(){

    const loaderWrapperEle = document.querySelector('.loader-wrapper')
    loaderWrapperEle.remove()

    if(currentPathnameSplitted[1] === "stories"){

        if(document.querySelector('.infoblock-loader-wrapper')){
            document.querySelector('.infoblock-loader-wrapper').remove()

        }

        if(window.innerWidth >= 1200){
            document.querySelector('.info-block').style = 'display: flex;'
        }

    } else {

        document.querySelector('.personal-info').style = 'display: grid;'

        if(window.innerWidth >= 1200){

            const infoblockPositionFromTop = document.querySelector('.personal-info').clientHeight
            document.querySelector('.profile-info-block').style = `display: flex; top: ${infoblockPositionFromTop}px`

        }
    }
 

}

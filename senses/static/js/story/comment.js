"use strict"

class Comment{

    commentListApiUrl = 'http://www.senses.tw/api/comments/'
    commentApiUrl = 'http://www.senses.tw/api/comment/'
    commentAddApiUrl = 'http://www.senses.tw/api/comments/add/'

    constructor(){

    }

    async getComments(kwargs){
        
        const storyId = kwargs.storyId
        const commentId = kwargs.commentId
        const page = kwargs.page

        if(storyId !== undefined){

            const response = await fetch(this.commentListApiUrl+ `?user=${currentUserId}&storyId=${storyId}&page=${page}`, {
                method: 'GET',
                cache: 'no-cache',
            }) 

            return await response.json();

        } else if(commentId !== undefined) {

            const response = await fetch(this.commentListApiUrl+ `?user=${currentUserId}&commentId=${commentId}&page=${page}`, {
                method: 'GET',
                cache: 'no-cache',
            })

            return await response.json();

        } else {

            const token = localStorage.getItem('token')

            const headers = {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json",
                "Accept": "application/json",   
            }            
            const followings = kwargs.followings
            const body = {"followings": followings,}
            const response = await fetch(this.commentListApiUrl, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(body),
                cache: 'no-cache',
            })
    
            return await response.json();            

        }
    }

    async addComment(kwargs){
        const token = localStorage.getItem('token')
        const text = kwargs.text
        const image = kwargs.image
        const userId = kwargs.userId
        const commentId = kwargs.commentId
        const storyId = kwargs.storyId
        const tagUsername = kwargs.tagUsername
        const storyCommentIdPair = JSON.stringify({"storyId": storyId, "commentId": commentId})
        const data = new FormData()

        data.append('userId', userId)
        data.append('text', text)
        data.append('image', image)
        data.append('storyCommentIdPair', storyCommentIdPair)
        data.append('tagUsername', tagUsername)
        
        const headers = {
            'Authorization': 'Bearer ' + token
        }

        fetch(this.commentAddApiUrl, {
            method: 'POST',
            headers: headers,
            body: data,
            cache: 'no-cache'
        })
        .then(response=>response.json())
        .then(response=>{
            window.location.reload()

        })
        .catch(error=>{
            console.log(error)
        })
    }

    async renderComments(triggeredEventEle, kwargs){
        
        this.getComments(kwargs)
            .then(response=>{

                const data = response.data
                const nextPage = response.nextPage
                const storyId = response.storyId
                const commentId = response.commentId
                
                let commentsNumList = response.commentsNum

                let likesNumList = response.likesNum
                let commentsIdOfTheComment = [];

                if(storyId){
                    renderCommentsOfStory(triggeredEventEle, nextPage, data, storyId, likesNumList, commentsNumList)
                } else {
                    renderCommentsOfComment(triggeredEventEle, nextPage, data, commentId, likesNumList, commentsIdOfTheComment)

                    // record page
                    idPagePairs.commentId = nextPage

                    // remove getting comments of next pages ele if no more comments
                    commentUtils.removeMoreStoryCommentsBtn({"commentId": commentId})
                    commentUtils.hideOverExpandingTexts({"commentId": commentId})
                    commentUtils.addListenersOnCommentInput(triggeredEventEle, {"commentId": commentId})

                    // add listeners on comment input
                    commentUtils.addListenersOnCommentForComment({"commentId": commentId})

                    // decide whether display delete btns or not
                    commentUtils.displayCurrentuserCommentDeleteBtns()
                    
                    // add listeners on deleting btns
                    commentUtils.addListenersForDeletingComment()


                    closeLoader()

                }

            }).catch(error=>{

                console.log(error)
            })
    }

    async deleteComment(triggeredEventEle, commentId){

        const token = localStorage.getItem('token')

        const headers = {
            'Authorization': 'Bearer ' + token
        }

        fetch(this.commentApiUrl+commentId+'/', {
            method:'DELETE',
            headers: headers,
            cache: 'no-cache',
        })
        .then(response => response.json())
        .then(response=>{

            if(response.success){
                const comment = triggeredEventEle.parentNode.parentNode.parentNode
                comment.remove()
                console.log('comment removed')
            } else {
                console.log('comment removing failed')
            }
            
        })
        .catch(error=>{
            console.log(error)
        })
    }
}

const comment = new Comment()

let idPagePairs = {}
let commentIdOfeEachComment = []

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// utils functions ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const commentUtils = {

    getMoreStoryComments(kwargs){

        const storyId = kwargs.storyId
        
        if(storyId){

            const morebuttonDataUtils = storyId.concat('', '-morebutton')
            const morebutton = document.querySelector(`[data-utils='${morebuttonDataUtils}']`)

            if(morebutton){

                morebutton.onclick = event => {

                    const triggeredEventEle = event.target

                    const triggeredEventClassName = triggeredEventEle.className
                    displayLoader(triggeredEventEle, triggeredEventClassName)

                    let timer;
                    timer = window.setTimeout(()=>{
                        comment.renderComments(triggeredEventEle, {'storyId':storyId, 'page': idPagePairs.storyId})
                    }, 1500)

                }
            }

        }
    },

    removeMoreStoryCommentsBtn(kwargs){

        const storyId = kwargs.storyId
        const commentId = kwargs.commentId

        if(storyId){

            const morebuttonDataUtils = storyId.concat('', '-morebutton')
            document.querySelectorAll(`[data-utils='${morebuttonDataUtils}']`).forEach(ele=>{
                ele.remove()
            })  

        } else {

            const morebuttonDataUtils = commentId.concat('', '-morebutton')
            document.querySelectorAll(`[data-utils='${morebuttonDataUtils}']`).forEach(ele=>{
                ele.remove()
            })  

        }
    },

    getMoreCommentsOfComment(){

        const commentIdList = commentIdOfeEachComment
        const lengthOfCommentIdList = commentIdList.length

        for(let i = 0; i < lengthOfCommentIdList; i++){

            const commentId = commentIdList.shift()
            const morebuttonDataUtils = commentId.concat('', '-commentcomments')
            const morebuttons = document.querySelector(`[data-utils='${morebuttonDataUtils}']`)

            if(morebuttons){

                morebuttons.onclick = event => {

                    const triggeredEventEle = event.target
                    triggeredEventEle.style.display = 'none'

                    const triggeredEventClassName = triggeredEventEle.className
                    displayLoader(triggeredEventEle, triggeredEventClassName)
    
                    let timer;
                    timer = window.setTimeout(()=>{
                        idPagePairs.commentId = 0
                        comment.renderComments(triggeredEventEle, {'commentId':commentId, 'page': idPagePairs.commentId})
                    }, 1500)

                }

            }

        }
    },

    removeMoreCommentsOfCommentBtn(kwargs){
        const commentId = kwargs.commentId
        const morebuttonDataUtils = commentId.concat('', '-commentcomments')
        document.querySelector(`[data-utils='${morebuttonDataUtils}']`).remove()
    },

    hideOverExpandingTexts(kwargs){

        const storyId = kwargs.storyId
        const commentId = kwargs.commentId

        if(storyId){

            const textDataUtils = storyId.concat('', '-text')

            document.querySelectorAll(`[data-utils='${textDataUtils}']`).forEach(ele=>{

                const commentClientHeight = ele.clientHeight
                const maxHeight = 60
    
    
                if(commentClientHeight -5 > maxHeight){
                    ele.style.maxHeight = maxHeight + 'px'
    
                    const html = `
                                <div class="comment-detail-text-viewMoreBtn">......顯示更多</div>
                                `
                    ele.insertAdjacentHTML('afterend', html)
                        
                    const addDisplayTextClickEvent = (ele) => {
                        this.addDisplayTextClickEvent(ele)
                    }
    
                    addDisplayTextClickEvent(ele)
                }
    
            }) 

        } else {

            const textDataUtils = commentId.concat('', '-text')

            document.querySelectorAll(`[data-utils='${textDataUtils}']`).forEach(ele=>{
    
                const commentClientHeight = ele.clientHeight
                const maxHeight = 60
    
    
                if(commentClientHeight -5 > maxHeight){
                    ele.style.maxHeight = maxHeight + 'px'
    
                    const html = `
                                <div class="comment-detail-text-viewMoreBtn">......顯示更多</div>
                                `
                    ele.insertAdjacentHTML('afterend', html)
                        
                    const addDisplayTextClickEvent = (ele) => {
                        this.addDisplayTextClickEvent(ele)
                    }
    
                    addDisplayTextClickEvent(ele)
                }
    
            })  
        }

    },

    addDisplayTextClickEvent(ele){

        const btn = ele.nextElementSibling

        btn.onclick = event => {
            const triggeredEventEle = event.target
            const targetedText = triggeredEventEle.previousElementSibling

            triggeredEventEle.remove()
            targetedText.style.maxHeight = ""
        }

    },

    addListenersOnCommentForComment(kwargs){
        
        const username = currentUserName
        const userAvatar = currentUserAvatar
        const storyId = kwargs.storyId
        const commentId = kwargs.commentId

        if(storyId){
            const commentOnCommentOfStory = storyId.concat('', '-commentoncommentofstory')
            document.querySelectorAll(`[data-utils='${commentOnCommentOfStory}']`).forEach(ele=>{
                ele.onclick = (event) => {

                    // clear all rendered result
                    const allRenderedResult = document.querySelectorAll('.write-comment-wrapper-comment')
                    if(allRenderedResult && allRenderedResult.length !== 0){
                        allRenderedResult.forEach(ele=>{
                            ele.remove()
                        })
                    }

                    const commentId = event.target.dataset.commentid
                    const imageUploadDataUtils = commentId.concat('', '-imageupload')
                    const writecommentErrorUtils = commentId.concat('', '-writeerror')

                    const html = `
                                <div class="write-comment-wrapper-comment">
                                    <div class="comment-image-preview-wrapper-comment"></div>
                                    <a href="/user/profile/${username}"><img class="write-comment-avatar-comment" src="${userAvatar}"/></a>
                                    <textarea class="write-comment-input-text-comment" name="write-comment-input-text-comment" placeholder="回覆" data-commentid="${commentId}"></textarea>
                                    <label class="form-image-content-label-comment" for="${commentId}" data-utils="${imageUploadDataUtils}"><i class="fa-solid fa-image"></i></label>
                                    <input type="file" accept="image/*" id="${commentId}" class="write-comment-input-image-comment" name="write-comment-input-image-comment"/>
                                    <button class="write-comment-submit-btn-comment" data-storyid="${commentId}">送出</button>
                                    <div class="write-comment-errorblock-comment" data-utils="${writecommentErrorUtils}">至少寫些文字嘛～</div>
                                </div>
                                `   
                    const insertedEle = event.target.parentNode.parentNode
                    insertedEle.insertAdjacentHTML('beforeend', html)

                    const writeCommentWrapperComment = event.target.parentNode.parentNode.lastElementChild
                    writeCommentWrapperComment.style.display = 'grid'

                    // enable image preview function
                    let commentOfCommentImageInputBtn;
                    const writeCommentWrapperCommentChildren = [...writeCommentWrapperComment.children]

                    for(const child of writeCommentWrapperCommentChildren){

                        if(child.tagName === 'INPUT'){
                            commentOfCommentImageInputBtn = child
                        }
                    }
                    addPreviews({"commentOfCommentImageInputBtn": commentOfCommentImageInputBtn}) 

                    const submitBtn = writeCommentWrapperComment.lastElementChild.previousElementSibling
                    submitBtn.onclick = () => {
                        // hide error block
                        const commentCommentErrorMessage = document.querySelector(`[data-utils='${writecommentErrorUtils}']`)
                        if(commentCommentErrorMessage.classList.contains('has-triggered')){
                            commentCommentErrorMessage.classList.remove('has-triggered')
                        } 

                        const textInput = submitBtn.previousElementSibling.previousElementSibling.previousElementSibling.value
                        const imageInput = commentImageOnCommentReadyForUploading

                        if(!textInput){
                            commentCommentErrorMessage.classList.add('has-triggered')
                        } else {
                            comment.addComment({'triggeredEventEle':event.target, 'text': textInput, 'image': imageInput, 'storyId': null, 'commentId': commentId, 'userId': currentUserId, 'tagUsername': null})
                        }
                    }
                }
            })
        } else {

            const commentOnCommentOfComment = commentId.concat('', '-commentoncommentofcomment')

            document.querySelectorAll(`[data-utils='${commentOnCommentOfComment}']`).forEach(ele=>{
                ele.onclick = (event) => {

                    // clear all rendered result
                    const allRenderedResult = document.querySelectorAll('.write-comment-wrapper-comment')
                    if(allRenderedResult && allRenderedResult.length !== 0){
                        allRenderedResult.forEach(ele=>{
                            ele.remove()
                        })
                    }

                    const selfCommentId = event.target.dataset.commentid
                    const imageUploadDataUtils = selfCommentId.concat('', '-imageupload')
                    const writecommentErrorUtils = selfCommentId.concat('', '-writeerror')

                    const tagUsername = ele.dataset.targetedusername

                    const html = `
                                <div class="write-comment-wrapper-comment">
                                    <div class="comment-image-preview-wrapper-comment"></div>
                                    <a href="/user/profile/${username}"><img class="write-comment-avatar-comment" src="${userAvatar}"/></a>
                                    <div class="write-comment-input-text-comment" name="write-comment-input-text-comment" data-commentid="${commentId}" contenteditable="true"><span class="tag-username edit" contenteditable="false">${tagUsername}</a></div>
                                    <label class="form-image-content-label-comment" for="${commentId}" data-utils="${imageUploadDataUtils}"><i class="fa-solid fa-image"></i></label>
                                    <input type="file" accept="image/*" id="${commentId}" class="write-comment-input-image-comment" name="write-comment-input-image-comment"/>
                                    <button class="write-comment-submit-btn-comment" data-storyid="${commentId}">送出</button>
                                    <div class="write-comment-errorblock-comment" data-utils="${writecommentErrorUtils}">至少寫些文字嘛～</div>
                                </div>
                                `   
                    const insertedEle = event.target.parentNode.parentNode.parentNode.parentNode.parentNode
                    insertedEle.insertAdjacentHTML('beforeend', html)

                    const writeCommentWrapperComment = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.lastElementChild
                    writeCommentWrapperComment.style.display = 'grid'

                    // scroll to comment writing block
                    const lastCommentDetailWrapper = [...document.querySelectorAll(`[data-commentdetailwrapper='${commentId+"-commentdetailwrapper"}']`)].at(-1)
                    lastCommentDetailWrapper.id = commentId + "-wrapper"           

                    // enable image preview function
                    let commentOfCommentImageInputBtn;
                    const writeCommentWrapperCommentChildren = [...writeCommentWrapperComment.children]

                    for(const child of writeCommentWrapperCommentChildren){

                        if(child.tagName === 'INPUT'){
                            commentOfCommentImageInputBtn = child
                        }
                    }

                    addPreviews({"commentOfCommentImageInputBtn": commentOfCommentImageInputBtn}) 

                    const submitBtn = commentOfCommentImageInputBtn.nextElementSibling
                    submitBtn.onclick = () => {

                        // hide error block
                        const writecommentErrorUtils = selfCommentId.concat('', '-writeerror')
                        const storycommentErrorMessage = document.querySelector(`[data-utils='${writecommentErrorUtils}']`)
                        if(storycommentErrorMessage.classList.contains('has-triggered')){
                            storycommentErrorMessage.classList.remove('has-triggered')
                        } 

                        const textblock = submitBtn.previousElementSibling.previousElementSibling.previousElementSibling
                        const textInput = tagUsername+"__divider__"+textblock.innerText.split(tagUsername)[1]
                        const imageInput = commentImageOnCommentReadyForUploading

                        if(!textInput){
                            storycommentErrorMessage.classList.add('has-triggered')
                        } else {
                            comment.addComment({'triggeredEventEle':event.target, 'text': textInput, 'image': imageInput, 'storyId': null, 'commentId': commentId, 'userId': currentUserId, 'tagUsername': tagUsername})
                        }
                    }
                }
            })
        }

    },

    addListenersOnCommentInput(triggeredEventEle, kwargs){

        const storyId = kwargs.storyId
        const commentId = kwargs.CommentId

        if(storyId){

            // for comment of the story
            const imageUploadDataUtils = storyId.concat('', '-imageupload')

            const commentSubmitBtn = document.querySelector(`[data-utils='${imageUploadDataUtils}']`).nextElementSibling.nextElementSibling

            commentSubmitBtn.onclick = event => {

                // hide error block
                const writecommentErrorUtils = storyId.concat('', '-writeerror')
                const storycommentErrorMessage = document.querySelector(`[data-utils='${writecommentErrorUtils}']`)
                if(storycommentErrorMessage.classList.contains('has-triggered')){
                    storycommentErrorMessage.classList.remove('has-triggered')
                } 

                const textInput = event.target.previousElementSibling.previousElementSibling.previousElementSibling.value
                const imageInput = commentImageReadyForUploading

                if(!textInput){
                    storycommentErrorMessage.classList.add('has-triggered')
                } else {
                    comment.addComment({'text': textInput, 'image': imageInput, 'storyId': storyId, 'commentId': commentId, 'userId': currentUserId, 'tagUsername': null})
                }
                            
            }

            // for comment of the comment

        } else {
            console.log('')
        }


    },

    displayCurrentuserCommentDeleteBtns(){
        const deleteBtns = [...document.querySelectorAll('.comment-delete-button')]
        deleteBtns.forEach(btn=>{
            const btnUsername = btn.dataset.username
            const currentUsername = currentUserName
            if(btnUsername !== currentUsername){
                btn.remove()
            }
        })
    },

    addListenersForDeletingComment(){
        const deleteBtns = [...document.querySelectorAll('.comment-delete-button')]
        deleteBtns.forEach(btn=>{
            btn.onclick = (event) => {
                const triggeredEventEle = btn
                const commentId = btn.dataset.commentid
                comment.deleteComment(triggeredEventEle, commentId)
            }
        })
    }

}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////// render function ////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function renderCommentsOfStory(triggeredEventEle, nextPage, data, storyId, likesNumList, commentsNumList){
    const storyComments = data.map(comment=>{
                        
        const selfCommentId = comment.id
        const avatar = comment.user.avatar;
        const username = comment.user.username;

        const createdTime = comment.time;
        const modifiedTime = comment.modified_time;
        const time = modifiedTime > createdTime ? modifiedTime + ' 已編輯' : createdTime
        const text = comment.text;

        const commentsNum = commentsNumList.shift()
        const likesNum  = likesNumList.shift()

        const image = comment.photos.map(photo=>{
            return photo.url
        })

        const likesNumDataUtils = storyId.concat('', '-likesnum')

        const commentcommentsDataUtils = selfCommentId.concat('', '-commentcomments')
        commentIdOfeEachComment.push(selfCommentId)

        const textDataUtils = storyId.concat('', '-text')
        const commentOnCommentOfStory = storyId.concat('', '-commentoncommentofstory')
        
        if(image.length !== 0 && commentsNum !== 0){
            return `<div class="comment-detail-wrapper">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-storyid="${storyId}" data-utils="${textDataUtils}">${text}</div>
                            <img class="comment-detail-image" src="${image}"/>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${likesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}" data-userid>喜歡</span>  
                                <span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentOnCommentOfStory}">回覆</span>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                            <div class="comment-comments" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-utils='${commentcommentsDataUtils}' data-commentsnum='${commentsNum}'>── 查看其他 ${commentsNum} 則回覆</div>
                        </div>
                    </div>
                    `
        } else if(image.length === 0 && commentsNum !== 0) {
            return `<div class="comment-detail-wrapper">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-storyid="${storyId}" data-utils="${textDataUtils}">${text}</div>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${likesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span> 
                                <span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentOnCommentOfStory}">回覆</span>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                            <div class="comment-comments" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-utils='${commentcommentsDataUtils}' data-commentsnum='${commentsNum}'>── 查看其他 ${commentsNum} 則回覆</div>
                        </div>
                    </div>
                    `   
        } else if (image.length !== 0 && commentsNum === 0){
            return `<div class="comment-detail-wrapper">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-storyid="${storyId}" data-utils="${textDataUtils}">${text}</div>
                            <img class="comment-detail-image" src="${image}"/>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${likesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span>  
                                <span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentOnCommentOfStory}">回覆</span>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `           
        } else {
            return `<div class="comment-detail-wrapper">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-storyid="${storyId}" data-utils="${textDataUtils}">${text}</div>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-storyid="${storyId}" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${likesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span> 
                                <span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentOnCommentOfStory}">回覆</span>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `    
        }
    }).join('');

    if(idPagePairs.storyId === 0) {

        // create button for getting next 12 comments of the story
        const morebuttonDataUtils = storyId.concat('', '-morebutton')
        const moreStoryCommentsHTML = `<div class="more-story-comments-wrapper">
                                            <div class="more-button" data-storyid="${storyId}" data-utils="${morebuttonDataUtils}">顯示更多留言......</div>
                                        </div>
                                        `

        if(triggeredEventEle.className === 'stories-click-comment'){
            const insertedEle = triggeredEventEle.parentNode

            // insert comments first
            insertedEle.insertAdjacentHTML('beforebegin', storyComments);

            // then insert more comments button
            if(nextPage){
                insertedEle.insertAdjacentHTML('beforebegin', moreStoryCommentsHTML)
            } 



        } else {

            const insertedEle = triggeredEventEle.parentNode.lastElementChild.previousElementSibling

            // insert comments first
            insertedEle.insertAdjacentHTML('beforebegin', storyComments);

            // then insert more comments button
            if(nextPage){
                insertedEle.insertAdjacentHTML('beforebegin', moreStoryCommentsHTML)
            }

        }


        // after clicking one of the two comments display button - commentNums or click-comment,
        // disable the other btn for preventing rendering duplicate comments
        let utilsDisplayCommentsEleList = []
        const displayCommentsDataUtils = storyId.concat('', '-displayComments')

        if(!triggeredEventEle.classList.contains("has-clicked")){
            document.querySelectorAll(`[data-utils='${displayCommentsDataUtils}']`).forEach(ele=>{
                ele.classList.add('has-clicked')
                utilsDisplayCommentsEleList.push(ele)
            })
        }

        // make top of the story comments have border attribute to divide itself from story 
        if(utilsDisplayCommentsEleList[0].nextElementSibling.nextElementSibling.className === 'comment-detail-wrapper'){
            utilsDisplayCommentsEleList[0].nextElementSibling.nextElementSibling.style = 'border-width: 1px 0 0 0;border-style:solid;border-color:#e0e0e0'
        }

        // set likesnum !== 0 element display 
        const likesNumDataUtils = storyId.concat('', '-likesnum')
        const commentLikesNumEleList = [...document.querySelectorAll(`[data-utils='${likesNumDataUtils}']`)]
        commentLikesNumEleList.forEach(ele=>{
            if(ele.dataset.likesnum !== '0'){
                ele.style.display = 'inline-block'
            }
        })
        
        // add listner ready for getting comments of next pages
        commentUtils.getMoreStoryComments({"storyId": storyId})
        commentUtils.getMoreCommentsOfComment()
        commentUtils.hideOverExpandingTexts({"storyId": storyId})
        commentUtils.addListenersOnCommentInput(triggeredEventEle, {"storyId": storyId})

        // add listeners on comment input
        commentUtils.addListenersOnCommentForComment({"storyId": storyId})

        // decide whether display delete btns or not
        commentUtils.displayCurrentuserCommentDeleteBtns()

        // add listeners on deleting btns
        commentUtils.addListenersForDeletingComment()

        // add listeners on adding comments Likes 
        likeUtils.addCommentsLikesClickListener()

        // add listeners on adding comment btns
        likeUtils.addCommentsLikeBtnsClickListener()

        // change color of click like btns of every comment
        like.changeLikeBtnsBgColorIfUserLiked()

        // record nextPage
        idPagePairs.storyId = nextPage

        closeLoader()

    } else {

        // insert comments first
        triggeredEventEle.parentNode.insertAdjacentHTML('beforebegin', storyComments);

        // set likesnum !== 0 element display 
        const likesNumDataUtils = storyId.concat('', '-likesnum')
        const commentLikesNumEleList = [...document.querySelectorAll(`[data-utils='${likesNumDataUtils}']`)]
        commentLikesNumEleList.forEach(ele=>{
            if(ele.dataset.likesnum !== '0'){
                ele.style.display = 'inline-block'
            }
        })

        // remove getting comments of next pages ele if no more comments
        if(!nextPage){
            commentUtils.removeMoreStoryCommentsBtn({"storyId": storyId})
        }

        // record page
        idPagePairs.storyId = nextPage

        commentUtils.getMoreStoryComments({"storyId": storyId})
        commentUtils.getMoreCommentsOfComment()
        commentUtils.hideOverExpandingTexts({"storyId": storyId})
        commentUtils.addListenersOnCommentInput(triggeredEventEle, {"storyId": storyId})

        // add listeners on comment input
        commentUtils.addListenersOnCommentForComment({"storyId": storyId})

        // decide whether display delete btns or not
        commentUtils.displayCurrentuserCommentDeleteBtns()

        // add listeners on deleting btns
        commentUtils.addListenersForDeletingComment()

        // add listeners on comments Likes 
        likeUtils.addCommentsLikesClickListener()

        // add listeners on adding comment btns
        likeUtils.addCommentsLikeBtnsClickListener()

        // change color of click like btns of every comment
        like.changeLikeBtnsBgColorIfUserLiked()

        closeLoader()

    }
}


function renderCommentsOfComment(triggeredEventEle, nextPage, data, commentId, likesNumList, commentsIdOfTheComment){

    const commentsOfComments = data.map(comment=>{

        const selfCommentId = comment.id
        commentsIdOfTheComment.push(selfCommentId)

        const avatar = comment.user.avatar;
        const username = comment.user.username;
    
        const createdTime = comment.time;
        const modifiedTime = comment.modified_time;
        const time = modifiedTime > createdTime ? modifiedTime + ' 已編輯' : createdTime
        let text = comment.text;
        const tagUsername = comment.tag_username
        
        if(tagUsername !== "null"){
             text = text.split('__divider__')[1]
        }

        const likesNum  = likesNumList.shift()
            
        const image = comment.photos
    
        const commentLikesNumDataUtils = selfCommentId.concat('', '-commentlikenums')
        const textDataUtils = commentId.concat('', '-text')
    
        const commentoncommentofcomment = commentId.concat('', '-commentoncommentofcomment')
    
        if(image.length !== 0 && tagUsername !== "null"){
    
            const url = image[0].url
    
            return `<div class="comment-detail-wrapper" data-commentdetailwrapper="${commentId+"-commentdetailwrapper"}">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-selfcommentid="${selfCommentId}" data-commentid="${commentId}" data-utils="${textDataUtils}"><a href="/user/profile/${tagUsername}"><span class="tag-username">${tagUsername}</span></a>&nbsp;${text}</div>
                            <img class="comment-detail-image" src="${url}"/>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num"data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${commentLikesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span>  
                                <a href="#${commentId}-wrapper"><span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentoncommentofcomment}" data-targetedusername="${username}">回覆</span></a>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `
        } else if(image.length === 0 && tagUsername != "null") {

            return `<div class="comment-detail-wrapper" data-commentdetailwrapper="${commentId+"-commentdetailwrapper"}">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-selfcommentid="${selfCommentId}" data-commentid="${commentId}" data-utils="${textDataUtils}"><a href="/user/profile/${tagUsername}"><span class="tag-username">${tagUsername}</span></a>&nbsp;${text}</div>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${commentLikesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span> 
                                <a href="#${commentId}-wrapper"><span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentoncommentofcomment}" data-targetedusername="${username}">回覆</span></a>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `     
        } else if(image.length !== 0 && tagUsername === "null") {

            const url = image[0].url

            return `<div class="comment-detail-wrapper" data-commentdetailwrapper="${commentId+"-commentdetailwrapper"}">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-selfcommentid="${selfCommentId}" data-commentid="${commentId}" data-utils="${textDataUtils}">${text}</div>
                            <img class="comment-detail-image" src="${url}"/>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${commentLikesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span> 
                                <a href="#${commentId}-wrapper"><span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentoncommentofcomment}" data-targetedusername="${username}">回覆</span></a>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `     
        } else {

            return `<div class="comment-detail-wrapper" data-commentdetailwrapper="${commentId+"-commentdetailwrapper"}">
                        <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                        <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                        <div class="comment-detail-created-time">${time}</div>
                        <div class="comment-detail-content-wrapper">
                            <div class="comment-detail-text" data-selfcommentid="${selfCommentId}" data-commentid="${commentId}" data-utils="${textDataUtils}">${text}</div>
                            <div class="comment-detail-likes-comments">
                                <span class="comment-likes-num" data-commentid="${selfCommentId}" data-likesnum="${likesNum}" data-utils="${commentLikesNumDataUtils}">${likesNum} 個喜歡</span>
                                <span class="comment-like" data-commentid="${selfCommentId}">喜歡</span> 
                                <a href="#${commentId}-wrapper"><span class="comment-comment-button" data-commentid="${selfCommentId}" data-utils="${commentoncommentofcomment}" data-targetedusername="${username}">回覆</span></a>
                                <span class="comment-delete-button" data-commentid="${selfCommentId}" data-username="${username}">刪除</span>
                            </div>
                        </div>
                    </div>
                    `     
        }

    });     

    // insert comments first
    for(const comment of commentsOfComments){
        triggeredEventEle.insertAdjacentHTML('beforebegin', comment);
    }

    // then insert more comments button
    if(!nextPage){
        commentUtils.removeMoreCommentsOfCommentBtn({"commentId": commentId})
    }

    // set likesnum !== 0 element display 
    if(commentsIdOfTheComment && commentsIdOfTheComment.length !==0){
        for(const commentId of commentsIdOfTheComment){
            const commentLikesNumDataUtils = commentId.concat('', '-commentlikenums')
            const commentLikesNumEle = document.querySelector(`[data-utils='${commentLikesNumDataUtils}']`)
            if(commentLikesNumEle.dataset.likesnum !== '0'){
                commentLikesNumEle.style.display = 'inline-block'
            }
        }
    }

    // add listeners on adding comments Likes 
    likeUtils.addCommentsOfCommentLikesClickListener()

    // add listeners on adding comment btns
    likeUtils.addCommentsLikeBtnsClickListener()

    // change color of click like btns of every comment
    like.changeLikeBtnsBgColorIfUserLiked()    

}
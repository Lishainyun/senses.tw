"use strict"

class Story{

    storyListApiUrl = 'http://127.0.0.1:8000/api/stories/'
    storyApiUrl = 'http://127.0.0.1:8000/api/story/'
    storyAddApiUrl = 'http://127.0.0.1:8000/api/stories/add/'
    storyId
    storyPhotos

    constructor(){

    }

    async getStoryList(){
        const response = await fetch(this.storyListApiUrl, {
            method: 'GET',
            cache: 'no-cache',
        })

        return await response.json();
    };

    async getSingleStory(storyId){

        const token = localStorage.getItem('token')

        const headers = {
            'Authorization': 'Bearer ' + token
        }

        const response = await fetch(this.storyApiUrl+storyId+'/', {
            method:'GET',
            headers: headers,
            cache: 'no-cache',
        })
        return await response.json();
    };


    async addStory(userId,imagesReadyForUploading){

        const token = localStorage.getItem('token')
        const text = document.querySelector('.form-text-content-input').value
        const images = imagesReadyForUploading
        const data = new FormData()

        data.append('userId', userId)
        data.append('text', text)
        images.forEach(image=>{
            data.append('image', image)
        })
        
        const headers = {
            'Authorization': 'Bearer ' + token
        }

        // check if the error message exists
        const addblockErrorMessage = document.querySelector('.addblock-error-message')

        if(addblockErrorMessage){
            addblockErrorMessage.remove()
        }
        
        if(text){

            fetch(this.storyAddApiUrl, {
                method: 'POST',
                headers: headers,
                body: data,
                cache: 'no-cache'
            })
            .then(response=>response.json())
            .then(response=>{
                location.reload()
            })
            .catch(error=>{
                console.log(error)
            })

        } else {
            const addBlockSubmitBtn = document.querySelector('.addblock-submit-button')
            const addblockErrorMessage = `<div class="addblock-error-message">至少寫些文字嘛～</div>`
            addBlockSubmitBtn.insertAdjacentHTML('beforebegin', addblockErrorMessage)
        }
        

    }

    async editStory(storyId){
        
        const editSubmitBtn = document.querySelector('.fadein-edit-button')
        editSubmitBtn.onclick = () => {

            const token = localStorage.getItem('token')
            const text = document.querySelector('.form-text-content-input').value
            const imageData = imagesReadyForUploading
            const imageFiles = []
            const originalFilename = []

            imageData.forEach(data=>{
                if(data.className === 'image-preview'){
                    originalFilename.push(data.dataset.imagename)
                } else {
                    imageFiles.push(data)
                }
            })

            console.log('imageData: ', imageData, imageFiles, originalFilename)

            const data = new FormData()
    
            data.append('text', text)
            imageFiles.forEach(file=>{
                data.append('imagefile', file)
            })

            originalFilename.forEach(url=>{
                data.append('originalFilename', url)
            })
            
            const headers = {
                'Authorization': 'Bearer ' + token
            }
    
            fetch(this.storyApiUrl+storyId+'/', {
                method: 'PATCH',
                headers: headers,
                body: data,
                cache: 'no-cache'
            })
            .then(response=>response.json())
            .then(response=>{
                const data = response
                console.log('data: ', data)
            })
            .catch(error=>{
                console.log(error)
            })
        
        }
    }

    async deleteStory(storyId){
        console.log(storyId)
    }

    async renderTheStoryForEditing(storyId, data){

        // render story text
        const storyText = data[0].text        
        const editTextArea = document.querySelector('.form-text-content-input')
        editTextArea.value = storyText

        // render story photo
        const storyPhotos = data[0].photos
        this.storyPhotos = [...storyPhotos]
        if(this.storyPhotos.length !== 0 ){

            const imagePreviewWrapper = document.querySelector('.image-preview-wrapper')
            imagePreviewWrapper.classList.add('has-previewImage')

            this.storyPhotos.forEach(storyPhoto=>{

                const photoName = storyPhoto.name

                const renderedHtml = `
                                      <span class="preview-images-delete">X</span>
                                      <img class="image-preview" data-imagename="${photoName}" data-imagesrc="original"/>
                                     `
                imagePreviewWrapper.insertAdjacentHTML('afterbegin', renderedHtml)

                const imagePreview = document.querySelector('.image-preview')
                imagePreview.src = storyPhoto.url
            })
        }

        // handle original image 

        let originalImages = []

        const originalImagesEle = [...document.querySelectorAll('.image-preview')]
        if(originalImagesEle && originalImagesEle.length !== 0){

            originalImagesEle.forEach(ele=>{
                if(ele.dataset.imagesrc === 'original'){
                    originalImages.push(ele)
                }
            })

            deletePreviews(event, {'originalImagesEle': originalImagesEle})
        }

        // calling editStory function
        this.editStory(storyId)


    }

    async renderStories(){

        getCurrentUserProfile()
        displayStoriesLoader()

        this.getStoryList()
            .then(response=>{

                const stories = response.map(story=>{

                    let storyId = story.id;
                    let storyAuthorAvatar = story.user.avatar;
                    let username = story.user.username;
                    let createdTime = story.time;
                    let text = story.text;
                    let upvoteTotal = story.upvote_total;
                    let commentsNum = story.comments.length

                    let commentIputPlaceholder;
                    if(loginStatus === "您已登入"){
                        commentIputPlaceholder = '留言'
                    } else{
                        commentIputPlaceholder = loginStatus
                    }
                    
                    return `<div class="render-stories-wrap">
                                <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                                <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                                <div class="stories-options" data-story="${storyId}">&ctdot;</div>
                                <div class="stories-time">${createdTime}</div>
                                <div class="stories-text">${text}</div>
                                <div class="stories-image-wrapper"></div>
                                <div class="stories-upvote" data-story="${storyId}">
                                    <img src="../static/images/story/comment-like.png"/>
                                    <p>${upvoteTotal} </p>
                                </div>                                    
                                <div data-story="${storyId}">${commentsNum} 則留言</div>
                                <div class="stories-click-like-comment-wrapper">
                                    <div class="stories-click-like"><i class="fa-solid fa-heart"></i>&nbsp喜歡</div>
                                    <div class="stories-click-comment" data-story="${storyId}"><i class="fa-solid fa-comment"></i>&nbsp留言</div>
                                </div>
                                <div class="write-comment-wrapper">
                                    <a href="${currentUserName}"><img class="write-comment-avatar" src="${currentUserAvatar}"/></a>
                                    <textarea class="write-comment-input-element" placeholder="${commentIputPlaceholder}" oninput="autoResizeInputElement()"></textarea>
                                    <i class="fa-solid fa-image"></i>
                                    <button class="write-comment-btn-element">送出</button>
                                </div>
                            </div>`                        

                }).join("");

                let selectedInsertElements = document.querySelectorAll('.stories-add-block');
                selectedInsertElements.forEach(element=>{
                    element.insertAdjacentHTML('afterend', stories)

                });

                // insert photos
                const insertedImageWrapper = [...document.querySelectorAll('.stories-image-wrapper')]
                
                let urls = []

                response.forEach(res=>{
                    urls.push(res.photos)
                })

                const normalizedURLs = urls.map(urls=>{

                    let urllist = [];

                    urls.forEach(url=>{
                        urllist.push(url.url)
                    })

                    return urllist
                })

                for(let i = 0 ; i < insertedImageWrapper.length ; i++){

                    normalizedURLs[i].forEach(url=>{

                        let html = `<img class="stories-image" src="${url}"/>`
                        insertedImageWrapper[i].insertAdjacentHTML('beforeend', html)

                    })

                }

            })
            .catch(error=>{
                console.log(error)
            })
            .then(()=>{

                // add listener for clicking edite buttun
                const optionsBtn = document.querySelectorAll('.stories-options')
                
                if(optionsBtn && optionsBtn.length !== 0){

                    optionsBtn.forEach(btn=>{

                        const storyId = btn.dataset.story

                        btn.addEventListener('click', (event)=>{

                            this.getSingleStory(storyId)
                            .then(response=>{
                                
                                let storyUserId = response[0].user.user_id

                                if(storyUserId === currentUserId){
                
                                    let html = `<div class="options-wrapper">
                                                    <div class="edit-story">編輯</div>
                                                    <div class="delete-story">刪除</div>
                                                    <div class="cancel">取消</div>
                                               </div>`
                                    btn.insertAdjacentHTML('afterend', html)

                                    btn.classList.add('has-clicked')

                                    // edit, delete, cancel click event
                                    const editBtn = document.querySelector('.edit-story')
                                    const deleteBtn = document.querySelector('.delete-story')
                                    const cancelBtn = document.querySelectorAll('.cancel')

                                    // edit
                                    editBtn.onclick = (event) => {
                                        const overlay = document.querySelector('.overlay')
                                        const fadeInele = document.querySelector('.stories-addblock-fadein-block')
                                        const storiesOptionsEle = event.target.parentElement.previousElementSibling
                                        const optionsWrapper = event.target.parentElement

                                        storiesOptionsEle.classList.remove('has-clicked')
                                        optionsWrapper.remove()

                                        // subtle change to fit editing use rather than adding use
                                        const addTitle = document.querySelector('.fadein-block-title')
                                        const editTitle = document.querySelector('.fadein-edit-title')
                                        if(getComputedStyle(addTitle).display === "block"){
                                            addTitle.style.display = "none"
                                            editTitle.style.display = "block"
                                        }

                                        const addSubmitBtn = document.querySelector('.addblock-submit-button')
                                        const editSubmitBtn = document.querySelector('.fadein-edit-button')
                                        if(getComputedStyle(addSubmitBtn).display === "block"){
                                            addSubmitBtn.style.display = "none"
                                            editSubmitBtn.style.display = "block"
                                        }

                                        renderFadeIns(overlay, fadeInele)
                                        this.renderTheStoryForEditing(storyId, response)

                                        
                                    }

                                    // delete
                                    // deleteBtn.onclick = this.deleteStory(storyId)

                                    // cancel
                                    cancelBtn.forEach(btn=>{
                                        btn.onclick = (event)=>{
                                            const storiesOptionsEle = event.target.parentElement.previousElementSibling
                                            const optionsWrapper = event.target.parentElement
                                            storiesOptionsEle.classList.remove('has-clicked')
                                            optionsWrapper.remove()
                                        }
                                    })

                                }
                            })
                        })
                        
                    })
                }

                // add event listener to every "upvote button" element
                // that has "storyId" class 
                document.querySelectorAll('.stories-upvote').forEach(ele=>{
                    ele.onclick = event =>{
                        if(currentUserName){
                            this.storyId = event.target.dataset.story
                            story.renderSingleStoryComments(this.storyId)
                        } else {
                            commentErrorMessageBlock(event)
                        }

                    }
                })

                // add event listener to every comment button element
                // that has "storyId" class 
                document.querySelectorAll('.stories-upvote').forEach(ele=>{
                    let commentNums = ele.nextSibling.nextSibling

                    commentNums.onclick = event =>{
                        this.storyId = event.target.dataset.story
                        let triggeredEvent = event.target
                        story.renderSingleStoryComments(triggeredEvent, this.storyId)

                    }
                })

                document.querySelectorAll('.stories-click-comment').forEach(ele=>{
                    ele.onclick = event =>{

                        if(currentUserName){

                            this.storyId = event.target.dataset.story
                            let triggeredEvent = event.target
                            story.renderSingleStoryComments(triggeredEvent, this.storyId)
                            
                            // display comment input 
                            const writeCommentWrapperEle = event.target.parentNode.nextElementSibling
                            writeCommentWrapperEle.style.display = 'grid'

                        } else {
                            commentErrorMessageBlock(event)
                        }

                    }
                })
            })
            .catch(error=>{
                console.log(error)
            })
    };

    async renderSingleStoryComments(triggeredEvent){
        this.getSingleStory(this.storyId)
        .then(response=>{

            // 點擊並展開留言內容後，讓特定storyId貼文的留言數量、留言按鈕listener失效
            // 防止重複的留言內容被呼叫並渲染
            if(!triggeredEvent.classList.contains("has-clicked")){
                
                document.querySelectorAll(`[data-story='${this.storyId}']`).forEach(element=>{
                    element.classList.add('has-clicked')
                })

                const comments = response[0].comments.map(comment=>{
                    let avatar = comment.user.avatar;
                    let username = comment.user.username;
                    let createdTime = comment.time;
                    let text = comment.text;
                    let image = comment.image 
                    
                    if(image){
                        return `<div class="comment-detail-wrapper">
                                    <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                                    <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                                    <div class="comment-detail-created-time">${createdTime}</div>
                                    <div class="comment-detail-text">${text}</div>
                                    <img class="comment-detail-image" src="${image}"/>
                                </div>`
                    } else{
                        return `<div class="comment-detail-wrapper">
                                    <a href="/user/profile/${username}"><img class="comment-detail-avatar" src="${avatar}"/></a>
                                    <a href="/user/profile/${username}"><div class="comment-detail-username">${username}</div></a>
                                    <div class="comment-detail-created-time">${createdTime}</div>
                                    <div class="comment-detail-text">${text}</div>
                                </div>`   
                    }
                }).join("");
    
                // let selectedInsertElement = all commentnums element of both pc and mobile;
                let selectedInsertElements = []
                
                Array.from(document.querySelectorAll(`[data-story='${this.storyId}']`)).forEach(element=>{
                    if(element.classList.length <= 1){
                        selectedInsertElements.push(element) 
                    }
                });

                selectedInsertElements.forEach(element=>{
                    element.insertAdjacentHTML('afterend', comments);
                })

                // add top border to divide the comments block and contents block
                let nextElementSiblingOfCommentsnum = []
                Array.from(document.querySelectorAll(`[data-story='${this.storyId}']`)).forEach(element=>{
                    if(element.classList.length <= 1){
                        nextElementSiblingOfCommentsnum.push(element.nextElementSibling) 
                    }
                });
                
                nextElementSiblingOfCommentsnum.forEach(element=>{
                    if(element.className !== 'stories-click-like-comment-wrapper'){
                        element.style = 'border-style:solid;border-width:1px 0 0 0;border-color:#e0e0e0'
                    }
                })
            }

        }).catch(error=>{
            console.log(error)
        })
    }

};

const story = new Story

// check if user is on story page. 
// If true, trigger renderStories method

if(currentPathnameSplitted.includes('stories')){
    story.renderStories()

    // add image-upload preivew feature
    const imageContentInputBtn = document.querySelector('.form-image-content-input')
    addPreviews(imageContentInputBtn)

    // add listener to add story submit button
    const addBlockSubmitBtn = document.querySelectorAll('.addblock-submit-button')
    addBlockSubmitBtn.forEach(btn=>{
        btn.addEventListener('click', function add(){
            story.addStory(currentUserId,imagesReadyForUploading)
        })
    })
}
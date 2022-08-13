"use strict"

class Story{

    storyListApiUrl = 'http://127.0.0.1:8000/api/stories/'
    storyApiUrl = 'http://127.0.0.1:8000/api/story/'
    storyAddApiUrl = 'http://127.0.0.1:8000/api/stories/add/'
    storyPhotos

    constructor(){

    }

    async getStoryList(page, keyword, userId){
        const response = await fetch(this.storyListApiUrl+`?keyword=${keyword}&page=${page}&user=${userId}`, {
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
            const originalFileId = []

            imageData.forEach(data=>{
                if(data.className === 'image-preview'){
                    originalFileId.push(data.dataset.imageid)
                } else {
                    imageFiles.push(data)
                }
            })

            const data = new FormData()
    
            data.append('text', text)
            imageFiles.forEach(file=>{
                data.append('imagefile', file)
            })

            originalFileId.forEach(id=>{
                data.append('originalFileId', id)
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
                location.reload()
            })
            .catch(error=>{
                console.log(error)
            })
        
        }
    }

    async deleteStory(storyId){
        const token = localStorage.getItem('token')

        const headers = {
            'Authorization': 'Bearer ' + token
        }

        fetch(this.storyApiUrl+storyId+'/', {
            method:'DELETE',
            headers: headers,
            cache: 'no-cache',
        })
        .then(response => response.json())
        .then(response=>{
            location.reload()
            
        })
        .catch(error=>{
            console.log(error)
        })
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
                const photoId = storyPhoto.id

                const renderedHtml = `
                                      <span class="preview-images-delete">X</span>
                                      <img class="image-preview" data-imageid="${photoId}" data-imagesrc="original"/>
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

    async renderStories(page, keyword){

        displayLoader()

        const userId = currentUserId

        this.getStoryList(page, keyword, userId)
            .then(response=>{
                                
                const stories = response.data.map(story=>{

                    const storyId = story.id;
                    const storyAuthorAvatar = story.user.avatar;
                    const username = story.user.username;

                    const createdTime = story.time;
                    const modifiedTime = story.modified_time;
                    const time = modifiedTime > createdTime ? modifiedTime + ' 已編輯' : createdTime
                                

                    const text = story.text;
                    const likesNum = story.likes_num;
                    const commentsNum = story.comments_num

                    let commentIputPlaceholder;
                    if(loginStatus === "您已登入"){
                        commentIputPlaceholder = '留言'
                    } else{
                        commentIputPlaceholder = loginStatus
                    }

                    const displayCommentsDataUtils = storyId.concat('', '-displayComments')
                    const imageUploadDataUtils = storyId.concat('', '-imageupload')
                    const writecommentErrorUtils = storyId.concat('', '-writeerror')
                    
                    return `<div class="render-stories-wrap">
                                <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                                <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                                <div class="stories-options" data-storyid="${storyId}">&ctdot;</div>
                                <div class="stories-time">${time}</div>
                                <div class="stories-text">${text}</div>
                                <div class="stories-image-wrapper"></div>
                                <div class="stories-likes" data-storyid="${storyId}">
                                    <img src="../static/images/story/comment-like.png"/>
                                    <p>${likesNum}</p>
                                </div>                                    
                                <div class="comment-nums" data-storyid="${storyId}" data-utils="${displayCommentsDataUtils}" data-commentsnum="${commentsNum}">${commentsNum} 則留言</div>
                                <div class="stories-click-like-comment-wrapper">
                                    <div class="stories-click-like" data-storyid="${storyId}"><i class="fa-solid fa-heart"></i>&nbsp喜歡</div>
                                    <div class="stories-click-comment" data-storyid="${storyId}" data-utils="${displayCommentsDataUtils}"><i class="fa-solid fa-comment"></i>&nbsp留言</div>
                                </div>
                                <div class="write-comment-wrapper">
                                    <div class="comment-image-preview-wrapper"></div>
                                    <a href="/user/profile/${username}"><img class="write-comment-avatar" src="${currentUserAvatar}"/></a>
                                    <textarea class="write-comment-input-text" name="write-comment-input-text" placeholder="${commentIputPlaceholder}" data-storyid="${storyId}" autofocus></textarea>
                                    <label class="form-image-content-label comment" for="${storyId}" data-utils="${imageUploadDataUtils}"><i class="fa-solid fa-image"></i></label>
                                    <input type="file" accept="image/*" id="${storyId}" class="write-comment-input-image" name="write-comment-input-image"/>
                                    <button class="write-comment-submit-btn" data-storyid="${storyId}">送出</button>
                                    <div class="write-comment-errorblock" data-utils="${writecommentErrorUtils}">至少寫些文字嘛～</div>
                                </div>
                            </div>`                        

                }).join("");

                // change different layout if page is not first loading
                const allStoriesWrapper = []


                if(page === 0){
                    const selectedInsertElements = document.querySelectorAll('.stories-add-block');
                    selectedInsertElements.forEach(element=>{
                        element.insertAdjacentHTML('afterend', stories)
    
                    });
                    
                    const allStoriesWrapperWithLoaderClass = document.querySelectorAll('.render-stories-wrap')
    

                    allStoriesWrapperWithLoaderClass.forEach(ele=>{
                        if(!ele.classList.contains('loader')){
                            allStoriesWrapper.push(ele)
                        }
                    })

                    const allStoriesWrapperNums = allStoriesWrapper.length
                    loadedStoriesNums = allStoriesWrapperNums

                    storyWrappersCount += response.data.length

                } else {

                    const storiesBlock = document.querySelector('.stories-block')
                    storiesBlock.insertAdjacentHTML('beforeend', stories)

                    const allStoriesWrapperWithLoaderClass = document.querySelectorAll('.render-stories-wrap')    
    
                    allStoriesWrapperWithLoaderClass.forEach(ele=>{
                        if(!ele.classList.contains('loader')){
                            allStoriesWrapper.push(ele)
                        }
                    })                    

                    for(let i = storyWrappersCount; i < storyWrappersCount + response.data.length; i++){
                        allStoriesWrapper[i].style.display = 'none'
                    }

                    const allStoriesWrapperNums = allStoriesWrapper.length
                    loadedStoriesNums = allStoriesWrapperNums

                    storyWrappersCount += response.data.length


                }

                const nextPage = response.nextPage
                scroll.page = nextPage 

                // insert photos
                this.insertPhotos(response)

            })
            .catch(error=>{
                console.log(error)
            })
            .then(()=>{

                storyUtils.addCommentNumsListener()
                storyUtils.addOptionListener()
                storyUtils.addClickCommentListener()

            })
            .catch(error=>{
                console.log(error)
            })
    };

    async insertPhotos(response){

        const allImageWrapper = [...document.querySelectorAll('.stories-image-wrapper')]
        const allImageWrapperNums = allImageWrapper.length
 
        let urls = []

        response.data.forEach(res=>{
            urls.push(res.photos)
        })

        const normalizedURLs = urls.map(urls=>{

            let urllist = [];

            urls.forEach(url=>{
                urllist.push(url.url)
            })

            return urllist
        })

        if(imageWrapperNums === 0){

            for(let i = 0 ; i < allImageWrapperNums ; i++){

                if(normalizedURLs[i] && normalizedURLs[i].length !== 0){
                    normalizedURLs[i].forEach(url=>{
    
                        let html = `<img class="stories-image" src="${url}"/>`
                        allImageWrapper[i].insertAdjacentHTML('beforeend', html)
    
                    })
                }
                
            }
            
        } else {

            const currentImageWrapperNums = allImageWrapperNums - imageWrapperNums
            const allImageWrapperRemoved = allImageWrapper.splice(0, imageWrapperNums)

            for(let i = 0 ; i < currentImageWrapperNums ; i++){

                if(normalizedURLs[i] && normalizedURLs[i].length !== 0){
                    normalizedURLs[i].forEach(url=>{
    
                        let html = `<img class="stories-image" src="${url}"/>`
                        allImageWrapper[i].insertAdjacentHTML('beforeend', html)
    
                    })
                }

            }

        }

        imageWrapperNums = allImageWrapperNums

    }

};

const story = new Story

// save timer for photoWrapper
let timer;

// save nums of image wrappers
let imageWrapperNums = 0;

let loadedStoriesNums = 0;

let storyWrappersCount = 0;


function renderWholeStoryPage(page, keyword){
    
    const timer1 = window.setTimeout(()=>{

        story.renderStories(page, keyword)

        clearTimeout(timer1)
    }, 100)

    timer = window.setTimeout(()=>{

        like.getLikesList({'userId': currentUserId})
        .then(response=>{
            like.changeLikeBtnsBgColorIfUserLiked(response)
            likeUtils.addStoreisLikeBtnsClickListener()

        })

        refreshPhotoWrapperEleList()
        addEventToAllPhotoWrapper()

        // add other utils
        storyUtils.hideOverExpandingTexts()
        likeUtils.addStoreisLikesClickListener()

        // add image-upload preivew feature
        const imageContentInputBtn = document.querySelector('.form-image-content-input')
        addPreviews({"imageContentInputBtn": imageContentInputBtn})

        // add listener to add story submit button
        const addBlockSubmitBtn = document.querySelectorAll('.addblock-submit-button')
        addBlockSubmitBtn.forEach(btn=>{
            btn.addEventListener('click', function add(){
                story.addStory(currentUserId,imagesReadyForUploading)
            })
        })

        clearTimeout(timer)

    }, 1500)



}

// check if user is on story page. 
// If true, trigger renderStories method

if(currentPathnameSplitted.includes('stories') || currentPathnameSplitted.includes('profile')){

    let page = 0;
    let keyword = "";

    renderWholeStoryPage(page, keyword)
}

const storyUtils = {

    hideOverExpandingTexts(){

        document.querySelectorAll('.stories-text').forEach(ele=>{


            if(ele.classList.length === 1){

                const storyClientHeight = ele.clientHeight
                const maxHeight = 62
    
                if(storyClientHeight > maxHeight){
                    ele.style.maxHeight = maxHeight + 'px'
    
                    const html = `
                                <div class="stories-text-viewMoreBtn">......顯示更多</div>
                                `
                    ele.insertAdjacentHTML('afterend', html)        
                    
                    const addDisplayTextClickEvent = (ele) => {
                        this.addDisplayTextClickEvent(ele)
                    }

                    addDisplayTextClickEvent(ele)
                }

            }

        })  

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

    addCommentNumsListener(){
        document.querySelectorAll('.comment-nums').forEach(ele=>{
            ele.onclick = event => {
    
                const triggeredEventEle = event.target
                const storyId = triggeredEventEle.dataset.storyid
                const commentsNum = parseInt(ele.dataset.commentsnum)
    
                if(!triggeredEventEle.classList.contains('has-clicked') && commentsNum > 0){
    
                    const triggeredEventClassName = triggeredEventEle.className
                    displayLoader(triggeredEventEle, triggeredEventClassName)
    
                    let timer;
                    timer = window.setTimeout(()=>{
                        idPagePairs.storyId = 0
                        const page = idPagePairs.storyId
                        comment.renderComments(triggeredEventEle, {'storyId': storyId, 'page': page, 'currentUserId': currentUserId})
                        clearTimeout(timer)
                    }, 1500)
    
                } 
    
            }
        })
    },

    addOptionListener(){
        // options listeners
        const optionsBtn = document.querySelectorAll('.stories-options')
                    
        if(optionsBtn && optionsBtn.length !== 0){

            optionsBtn.forEach(btn=>{

                btn.addEventListener('click', (event)=>{

                    const storyId = event.target.dataset.storyid

                    story.getSingleStory(storyId)
                    .then(response=>{
                                    
                        let storyUserId = response[0].user.user_id

                        if(storyUserId === currentUserId){
                    
                            let html = `<div class="options-wrapper">
                                            <div class="edit-story"><i class='bx bxs-edit'></i> 編輯</div>
                                            <div class="delete-story"><i class='bx bxs-eraser'></i> 刪除</div>
                                            <div class="cancel"><i class='bx bx-x'></i> 取消</div>
                                        </div>`
                            btn.insertAdjacentHTML('afterend', html)
                            optionsBtn.forEach(optionsBtn=>{
                                optionsBtn.classList.add('has-clicked')
                            })

                            // edit, delete, cancel click event
                            const editBtn = document.querySelector('.edit-story')
                            const deleteBtn = document.querySelector('.delete-story')
                            const cancelBtn = document.querySelector('.cancel')

                            // edit story
                            editBtn.onclick = (event) => {
                                const overlay = document.querySelector('.overlay')
                                const fadeInele = document.querySelector('.stories-addblock-fadein-block')

                                optionsBtn.forEach(optionsBtn=>{
                                    optionsBtn.classList.remove('has-clicked')
                                })

                                const optionsWrapper = event.target.parentElement
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
                                story.renderTheStoryForEditing(storyId, response)
    
                            }

                            // delete story
                            deleteBtn.onclick = (event)=>{

                                const overlay = document.querySelector('.overlay')
                                const messageBlock = document.querySelector('.messageBlock-fadein-block')
                                renderFadeIns(overlay, messageBlock)

                                const deleteCancel = () => {

                                    optionsBtn.forEach(optionsBtn=>{
                                        optionsBtn.classList.remove('has-clicked')
                                    })

                                    const optionsWrapper = event.target.parentElement
                                    optionsWrapper.remove()

                                    messageBlock.classList.remove('has-triggered')
                                    overlay.classList.remove('has-triggered')
                                }

                                const deleteConfirm = () => {
                                    const storyId = event.target.parentElement.previousElementSibling.dataset.storyid
                                    story.deleteStory(storyId)
                                }

                                const cancel = document.querySelector('.delete-cancel-btn')
                                const confirm = document.querySelector('.delete-confirm-btn')

                                cancel.onclick = deleteCancel
                                confirm.onclick = deleteConfirm

                            }

                            // cancel editing
                            cancelBtn.onclick = (event)=>{

                                optionsBtn.forEach(optionsBtn=>{
                                    optionsBtn.classList.remove('has-clicked')
                                })

                                const optionsWrapper = event.target.parentElement
                                optionsWrapper.remove()

                            }


                        }
                    })
                })
                            
            })
        }
    },

    addClickCommentListener(){
        document.querySelectorAll('.stories-click-comment').forEach(ele=>{
            ele.onclick = event =>{
    
                const triggeredEventEle = event.target
                const storyId = triggeredEventEle.dataset.storyid
                const commentsNum = parseInt(ele.parentNode.previousElementSibling.dataset.commentsnum)
    
                if(!triggeredEventEle.classList.contains('has-clicked') && commentsNum > 0){
    
                    const triggeredEventClassName = triggeredEventEle.className
                    displayLoader(triggeredEventEle, triggeredEventClassName)
    
                    let timer;
                    timer = window.setTimeout(()=>{
                        idPagePairs.storyId = 0
                        const page = idPagePairs.storyId
                        comment.renderComments(triggeredEventEle, {'storyId':storyId, 'page': page, 'currentUserId': currentUserId})
                                    
                        // display comment input 
                        const writeCommentWrapperEle = triggeredEventEle.parentNode.nextElementSibling
                        writeCommentWrapperEle.style.display = 'grid'
        
                        // enable image preview function
                        let commentImageInputBtn;
                        const writeCommentWrapperEleChildren = [...writeCommentWrapperEle.children]
        
                        for(const child of writeCommentWrapperEleChildren){
                            if(child.tagName === 'INPUT'){
                                commentImageInputBtn = child
                            }
                        }
    
                        addPreviews({"commentImageInputBtn": commentImageInputBtn})
    
                        clearTimeout(timer)
                    }, 1500)
                } else {
     
                    // display comment input 
                    const writeCommentWrapperEle = triggeredEventEle.parentNode.nextElementSibling
                    writeCommentWrapperEle.style.display = 'grid'
    
                    // enable image preview function
                    let commentImageInputBtn;
                    const writeCommentWrapperEleChildren = [...writeCommentWrapperEle.children]
    
                    for(const child of writeCommentWrapperEleChildren){
    
                        if(child.tagName === 'INPUT'){
                            commentImageInputBtn = child
                        }
                    }
    
                    addPreviews({"commentImageInputBtn": commentImageInputBtn}) 
    
                    commentUtils.addListenersOnCommentInput(triggeredEventEle, {"storyId": storyId})
    
                   
                }
    
            }
        })
    },




}
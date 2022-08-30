"use strict"

class Story{

    storyListApiUrl = 'http://44.199.90.64:8000/api/stories/'
    storyApiUrl = 'http://44.199.90.64:8000/api/story/'
    storyAddApiUrl = 'http://44.199.90.64:8000/api/stories/add/'
    storyPhotos

    constructor(){

    }

    async getStoryList(page, keyword, userId, kwargs){

        if(kwargs && kwargs.length !== 0){

            const token = localStorage.getItem('token')

            const headers = {
                'Authorization': 'Bearer ' + token,
                "Content-Type": "application/json",
                "Accept": "application/json",   
            }            
            const followings = kwargs.followings
            const body = {"followings": followings,}
            const response = await fetch(this.storyListApiUrl, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(body),
                cache: 'no-cache',
            })
    
            return await response.json();

        } else {
            let profileLocation; 
            let profileLocationUsername;
            if(currentPathnameSplitted[2] === 'profile'){
                profileLocation = currentPathnameSplitted[2]
                profileLocationUsername =  usernameOfCurrentPathname
            }
    
            const currentLocation = profileLocation || 'story'
            const currentLocationUsername = profileLocationUsername || null
    
            const response = await fetch(this.storyListApiUrl+`?keyword=${keyword}&page=${page}&user=${userId}&currentLocation=${currentLocation}&currentLocationUsername=${currentLocationUsername}`, {
                method: 'GET',
                cache: 'no-cache',
            })
    
            return await response.json();
        }



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

        let userId = currentUserId;

        this.getStoryList(page, keyword, userId)
            .then(response=>{
                
                const data = response.data
                const result = Array.isArray(data)
                let stories;
                
                if(result){
                    stories = data.map(story=>{

                        const storyId = story.id;
                        const storyAuthorAvatar = story.user.avatar
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

                        const cloudFront = 'http://d3knydgma6pz3s.cloudfront.net/'
                        
                        return `<div class="render-stories-wrap">
                                    <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                                    <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                                    <div class="stories-options" data-storyid="${storyId}" data-user="${username}">&ctdot;</div>
                                    <div class="stories-time">${time}</div>
                                    <div class="stories-text">${text}</div>
                                    <div class="stories-image-wrapper"></div>
                                    <div class="stories-likes" data-storyid="${storyId}">
                                        <img src="${cloudFront}static/images/story/comment-like.png"/>
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

                } else {

                    const storyId = data.id;
                    const storyAuthorAvatar = data.user.avatar
                    const username = data.user.username;

                    const createdTime = data.time;
                    const modifiedTime = data.modified_time;
                    const time = modifiedTime > createdTime ? modifiedTime + ' 已編輯' : createdTime
                                

                    const text = data.text;
                    const likesNum = data.likes_num;
                    const commentsNum = data.comments_num

                    let commentIputPlaceholder;
                    if(loginStatus === "您已登入"){
                        commentIputPlaceholder = '留言'
                    } else{
                        commentIputPlaceholder = loginStatus
                    }

                    const displayCommentsDataUtils = storyId.concat('', '-displayComments')
                    const imageUploadDataUtils = storyId.concat('', '-imageupload')
                    const writecommentErrorUtils = storyId.concat('', '-writeerror')

                    const cloudFront = 'http://d3knydgma6pz3s.cloudfront.net/'

                    
                    stories = `<div class="render-stories-wrap">
                                    <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                                    <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                                    <div class="stories-options" data-storyid="${storyId}" data-user="${username}">&ctdot;</div>
                                    <div class="stories-time">${time}</div>
                                    <div class="stories-text">${text}</div>
                                    <div class="stories-image-wrapper"></div>
                                    <div class="stories-likes" data-storyid="${storyId}">
                                        <img src="${cloudFront}static/images/story/comment-like.png"/>
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

                }


                // change different layout if page is not first loading
                const allStoriesWrapper = []

                if(page === 0){

                    const selectedInsertElements = document.querySelector('.stories-add-block');
                    selectedInsertElements.insertAdjacentHTML('afterend', stories)
                    
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

                // insert photos
                this.insertPhotos(response)

                const nextPage = response.nextPage
                scroll.page = nextPage 

            })
            .catch(error=>{
                console.log(error)
            })
            .then(()=>{                

                if(currentPathnameSplitted.includes('profile')){
                    const fadeInele = document.querySelector('.stories-addblock-fadein-block')
                    fadeInele.classList.add('profile')
                    console.log("currentPathnameSplitted.includes('profile')")

                    if(!currentPathnameSplitted.includes(currentUserName)){
                        const storiesAddBlcokEle = document.querySelector('.stories-add-block');
                        storiesAddBlcokEle.style.display = 'none'
                        console.log('!currentPathnameSplitted.includes(currentUserName)')

                    }
                }

                const storiesOptionsEles = document.querySelectorAll('.stories-options')
                storiesOptionsEles.forEach(ele=>{
                    if(ele.dataset.user !== currentUserName){
                        ele.style.display = 'none'
                    }
                })

                storyUtils.addCommentNumsListener()
                storyUtils.addOptionListener()
                storyUtils.addClickCommentListener()
                refreshPhotoWrapperEleList()
                addEventToAllPhotoWrapper()
            

            })
            .catch(error=>{
                console.log(error)
            })
            .then(()=>{
                renderStoreisFinished = true
            })
    };

    async insertPhotos(response){

        const allImageWrapper = [...document.querySelectorAll('.stories-image-wrapper')]
        const allImageWrapperNums = allImageWrapper.length
 
        let urls = []

        if(Array.isArray(response.data)){
            response.data.forEach(res=>{
                urls.push(res.photos)
            })
        } else {
            urls.push(response.data.photos)
        }


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

// save nums of image wrappers
let imageWrapperNums = 0;
let loadedStoriesNums = 0;
let storyWrappersCount = 0;

// loading finished flag
let renderStoreisFinished = false
let postingActivitiesFinished = false
let commentingActivitiesFinished = false
let displayFollowingUsersActivitiesFinished = false

const storyUtils = {

    hideOverflowTexts(){

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

    displayPostingActivities(page, user, keyword, followings){
        
        story.getStoryList(page, user, keyword, {'followings': followings, })
        .then(response=>{

            postingActivitiesFinished = true
            
            const rawData = response.data

            const followingActivitiesHTML = rawData.map(data=>{

                data.forEach(data=>{
                    const id = data.id
                    const avatar = data.user.avatar
                    const username = data.user.username
                    const time = data.time
                    const text = data.text
                    
                    const HTML = `
                                <div class="info-block-wrapper" data-id="${id}">
                                    <img class="infoblock-avatar" src="${avatar}"/>
                                    <div class="infoblock-username">${username}</div>
                                    <div class="infoblock-time">${time}</div>
                                    <div class="infoblock-message">分享故事：「${text}」</div> 
                                </div>
                                `
                    if(document.querySelector('.info-block')){
                        document.querySelector('.info-block').insertAdjacentHTML('afterbegin', HTML)
                    } else {
                        document.querySelector('.profile-info-block').insertAdjacentHTML('afterbegin', HTML)
                    }
                })
            })

        })
        .catch(error=>{
            console.log(error)
        })
    },

    displayCommentingActivities(followings){
        
        comment.getComments({'followings': followings,})
        .then(response=>{
            
            commentingActivitiesFinished = true


            if(response && response.data.length !== 0){

                const rawData = response.data

                rawData.forEach(data=>{

                    if (data && data.length !== 0){

                        data.forEach(data=>{

                            const id = data.id
                            const avatar = data.user.avatar
                            const username = data.user.username
                            const time = data.time
                            const text = data.text
            
                            const HTML = `
                                        <div class="info-block-wrapper" data-id="${id}">
                                            <img class="infoblock-avatar" src="${avatar}"/>
                                            <div class="infoblock-username">${username}</div>
                                            <div class="infoblock-time">${time}</div>
                                            <div class="infoblock-message">在一則故事中留言：「${text}」</div> 
                                        </div>
                                        `
                            if(document.querySelector('.info-block')){
                                document.querySelector('.info-block').insertAdjacentHTML('afterbegin', HTML)
                            } else {
                                document.querySelector('.profile-info-block').insertAdjacentHTML('afterbegin', HTML)
                            }

                        })
                    }                   
                })


            } 
        })
        .catch(error=>{
            console.log(error)
        })
    },

    addEventListenerOnEveryNotification(){
        document.querySelectorAll('.info-block-wrapper').forEach(ele=>{
            ele.onclick = () => {
                window.location.href = `/stories/${ele.dataset.id}/`
            }
        })
    },

    addEventListenerOnNotificationBtn(){

        document.querySelector('.navNotificationBtn').onclick = debounce(()=>{

            const storiesInfoBlock = document.querySelector('.info-block')
            const profileInfoBlock = document.querySelector('.profile-info-block')
            if(storiesInfoBlock){
                storiesInfoBlock.classList.add('mobile')
                this.addEventListenerOnEveryNotification()
            } else {
                profileInfoBlock.classList.add('mobile')
                this.addEventListenerOnEveryNotification()
            }

            const mobilestoriesInfoBlock = document.querySelector('.info-block.mobile')
            const mobileProfileInfoBlock = document.querySelector('.profile-info-block.mobile')
            if(mobilestoriesInfoBlock){
                document.addEventListener('click', event=>{
                    if(!mobilestoriesInfoBlock.contains(event.target)){
                        mobilestoriesInfoBlock.classList.remove('mobile')
                    }
                })
            } else {
                document.addEventListener('click', event=>{
                    if(!mobileProfileInfoBlock.contains(event.target)){
                        mobileProfileInfoBlock.classList.remove('mobile')
                    }
                })
            }

        }, 250)
    },

    displayFollowingUsersActivities(){

        const storiesInfoBlock = document.querySelector('.info-block')
        const profileInfoBlock = document.querySelector('.profile-info-block')

        const activitiesData = JSON.parse(localStorage.getItem(currentUserName))

        let followings;
        if(activitiesData){
            followings = activitiesData.followingData.followingList.map(following=>{return following.user_id})
        } 

        let page;
        let user;
        let keyword;

        if(storiesInfoBlock && localStorage.getItem('token') && followings !== undefined){

            if(followings.length === 0){
                const html = `<div class="infoblock-empty-message">追蹤者們最近沒有新的動態～</div>`
                storiesInfoBlock.insertAdjacentHTML('afterbegin', html)
                document.querySelector('.infoblock-empty-message').style.display = "block"

            }

            this.displayPostingActivities(page, user, keyword, followings)
            this.displayCommentingActivities(followings)

        } else if(profileInfoBlock && localStorage.getItem('token') && followings !== undefined) {

            if(followings.length === 0){
                const html = `<div class="infoblock-empty-message">追蹤者們最近沒有新的動態～</div>`
                profileInfoBlock.insertAdjacentHTML('afterbegin', html)
                document.querySelector('.infoblock-empty-message').style.display = "block"

            }
            this.displayPostingActivities(page, user, keyword, followings)
            this.displayCommentingActivities(followings)


        } else {

            [storiesInfoBlock, profileInfoBlock].forEach(ele=>{
                if(ele && localStorage.getItem('token')){

                    postingActivitiesFinished = true
                    commentingActivitiesFinished = true

                    const html = `<div class="infoblock-empty-message">追蹤者們最近沒有新的動態～</div>`
                    ele.insertAdjacentHTML('afterbegin', html)
                    document.querySelector('.infoblock-empty-message').style.display = "block"


                } else if (ele && currentPathnameSplitted[3] !== currentUserName){

                    ele.remove()
                    document.querySelector('.stories-add-block').style.display = 'none'

                } else if (ele){

                    postingActivitiesFinished = true
                    commentingActivitiesFinished = true

                    const html = `<div class="infoblock-empty-message">請先登入以獲得追蹤者最新動態～</div>`
                    ele.insertAdjacentHTML('afterbegin', html)
                    document.querySelector('.infoblock-empty-message').style.display = "block"


                }

            })
        }

        const interval = window.setInterval(()=>{
            
            if(postingActivitiesFinished === true && commentingActivitiesFinished === true){
                
                clearInterval(interval)

                if(window.innerWidth >= 1200){
                    storyUtils.addEventListenerOnEveryNotification()
                } else {
                    storyUtils.addEventListenerOnNotificationBtn()
                }

                displayFollowingUsersActivitiesFinished = true

                console.log('ready')

            } 

        }, 100)

    },


}
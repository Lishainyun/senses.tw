"use strict"

let loginStatus;
let currentUserAvatar;
let currentUserName;
let currentUserBackground;
let currentUserId;

class Profile{

    defaultUserAvatar = 'http://127.0.0.1:8000/static/media_uploaded/images/profile/default.png';
    defaultUserBackground = '';
    loginStatus = '您尚未登入';

    currentUserAvatar;
    currentUserBackground;
    currentUserBio;
    currentUserIntro;
    currentUserName;
    currentUserId;

    constructor(){

    }

    async getProfile(username){
        const profileApiUrl = `http://127.0.0.1:8000/api/user/profile/${username}`
        const response = await fetch(profileApiUrl, {
            method: 'GET',
            cache: 'no-cache' 
        })
        return await response.json()
    }

    async getCurrentUserProfile(){
        const data = await checkUserStatus()
        const userStatus = data.status
        const token = data.token

        const CurrentUserProfileApiUrl = 'http://127.0.0.1:8000/api/user/profile/';
        const headers = {'Content-Type': 'application/json'}
        const body = {'token': token} 

        if(userStatus === "isAuthenticated"){
            fetch(CurrentUserProfileApiUrl, {

                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(body),
                cache: 'no-cache',

            })
            .then(response=>response.json())
            .then(response=>{
                
                this.loginStatus = loginStatus = '您已登入'
                this.currentUserId = currentUserId = response['user_id']
                this.currentUserAvatar = currentUserAvatar = response['avatar']
                this.currentUserBackground = currentUserBackground = response['background_image']
                this.currentUserName = currentUserName = response['username']
                
                this.currentUserBio = response['bio']
                this.currentUserIntro = response['intro']

                // when user is logged in, change navbar profile button href attribute
                // and avoid logged in user going to login page.
                redirectNavProfileBtnHrefToPersonal(currentUserName)
                redirectWhileLoadingForbiddenPage(currentUserName)

                // render page if user is on profile page
                this.renderProfilePage()

            })
            .catch(error=>{
                console.log(error)
            })
        } else{
            loginStatus = this.loginStatus
            currentUserAvatar = this.defaultUserAvatar;
            currentUserName = this.defaultUserName;
            currentUserBackground = this.defaultUserBackground;

            // render page if user is on profile page
            this.renderProfilePage()
        }
    }

    async renderProfilePage(){

        // check if user is on profile page
        if(currentPathnameSplitted.includes('profile')){

            const personalInfoElement = document.querySelector('.personal-info') // inserted html element 

            this.getProfile(usernameOfCurrentPathname)
            .then(response=>{

                const data = response
                let background = data.background_image
                let avatar = data.avatar
                let username = data.username
                let intro = data.intro
                let bio = data.bio

                // check if the username extracted from pathname exists //

                // if not exist, render the error page
                if(response.error){

                    const personalStoriesBlocks = document.querySelector('.personal-stories-block')
                    personalStoriesBlocks.style.display = 'none'

                    const errorMessage = "該用戶不存在"
                    const backToPreviousPage = "回上頁"
                    const toStoryPage = "前往傾聽故事"
                    const profileErrorHTML = `
                                            <div class="profile-errorMessage">${errorMessage}</div>
                                            <div class="profile-backToPreviousPage">${backToPreviousPage}</div>
                                            <div class="profile-toStoryPage">${toStoryPage}</div>
                                            `

                    personalInfoElement.insertAdjacentHTML('afterbegin', profileErrorHTML)

                // if exists render user's page
                } else{

                    // check if current user is on its own profile page
                    if(usernameOfCurrentPathname === currentUserName){

                        const profileInfoHTML = `
                                            <div class="profile-top-username">${currentUserName}</div>
                                            <img class="profile-background" src="${currentUserBackground}"></img>
                                            <img class="profile-avatar" src="${currentUserAvatar}"></img>
                                            <div class="profile-username">${currentUserName}</div>
                                            <div class="profile-intro">${this.currentUserIntro}</div>
                                            <div class="editprofile-logout-block">
                                                <div class="edit-profile">編輯個人資料</div>
                                                <div class="logout">登出</div>
                                            </div>
                                            <div class="profile-bio">${this.currentUserBio}</div>
                                            `

                        personalInfoElement.insertAdjacentHTML('afterbegin', profileInfoHTML)

                        // render stories of the profile
                        this.renderSingleProfileStories(data)

                        // add listener for the logout btn
                        user.logoutUser()

                    } else{
                        const profileInfoHTML = `
                                                <img class="profile-background" src="${background}"></img>
                                                <img class="profile-avatar" src="${avatar}"></img>
                                                <div class="profile-username">${username}</div>
                                                <div class="profile-intro">${intro}</div>
                                                <div class="profile-bio">${bio}</div>
                                                `
                        personalInfoElement.insertAdjacentHTML('afterbegin', profileInfoHTML)

                        // render profile stories
                        this.renderSingleProfileStories(data)
                    }
                }
            })
            .catch(error=>{
                console.log(error)
            })

        }
    }

    async renderSingleProfileStories(profileData){
        
        const profileStoriesData = profileData.self_stories
        const profileStories = profileStoriesData.map(story=>{
            
            let storyId = story.id;
            let storyAuthorAvatar = story.user.avatar;
            let username = story.user.username;
            let createdTime = story.time;
            let modified_time = story.modified_time;
            let text = story.text;
            let image = story.image;
            let upvoteTotal = story.upvote_total;
            let commentsNum = story.comments.length
            
            let commentIputPlaceholder;

            if(loginStatus === "您已登入"){
                commentIputPlaceholder = '留言'
            } else{
                commentIputPlaceholder = loginStatus
            }
            
            if(image){
                return `<div class="render-stories-wrap">
                            <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                            <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                            <div class="stories-options">&ctdot;</div>
                            <div class="stories-time">${createdTime}</div>
                            <div class="stories-text">${text}</div>
                            <img class="stories-image" src="${image}"/>
                            <div class="stories-upvote" data-story="${storyId}">
                                <img src="/static/images/story/comment-like.png"/>
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
            } else{
                return `<div class="render-stories-wrap">
                            <a href="/user/profile/${username}"><img class="stories-avatar" src="${storyAuthorAvatar}"/></a>
                            <a href="/user/profile/${username}"><div class="stories-username">${username}</div></a>
                            <div class="stories-options">&ctdot;</div>
                            <div class="stories-time">${createdTime}</div>
                            <div class="stories-text">${text}</div>
                            <div class="stories-upvote" data-story="${storyId}">
                                <img src="/static/images/story/comment-like.png"/>
                                <p>${upvoteTotal} </p>
                            </div>
                            <div data-story="${storyId}">${commentsNum} 則留言</div>
                            <div class="stories-click-like-comment-wrapper">
                                <div class="stories-click-like"><i class="fa-solid fa-heart"></i>&nbsp喜歡</div>
                                <div class="stories-click-comment" data-story="${storyId}"><i class="fa-solid fa-comment"></i>&nbsp留言</div>
                            </div>
                            <div class="write-comment-wrapper">
                                <a href="/user/profile/${currentUserName}"><img class="write-comment-avatar" src="${currentUserAvatar}"/></a>
                                <textarea class="write-comment-input-element" placeholder="${commentIputPlaceholder}" oninput="autoResizeInputElement()"></textarea>
                                <i class="fa-solid fa-image"></i>
                                <button class="write-comment-btn-element">送出</button>
                            </div>
                        </div>`
            }
        }).join("");

        const personalStoriesAddBlockBtn = document.querySelector('.stories-addblock-button') // inserted html element 
        personalStoriesAddBlockBtn.insertAdjacentHTML('afterend', profileStories)  
        
        // add event listener to every "upvote button" element
        // that has "storyId" class 
            // document.querySelectorAll('.stories-upvote').forEach(ele=>{
            //     ele.onclick = event =>{
            //         this.storyId = event.target.dataset.story
            //         this.username = usernameOfCurrentPathname
            //         this.renderSingleProfileStoryComments()
            //     }
            // })

        // add event listener to every comment button element
         // that has "storyId" class 
        document.querySelectorAll('.stories-upvote').forEach(ele=>{
            let commentNums = ele.nextSibling.nextSibling

            commentNums.onclick = event =>{

                const triggeredEvent = event.target
                this.storyId = triggeredEvent.dataset.story
                this.renderSingleProfileStoryComments(triggeredEvent)
            }
        })

        document.querySelectorAll('.stories-click-comment').forEach(ele=>{
            ele.onclick = event =>{

                const triggeredEvent = event.target
                this.storyId = triggeredEvent.dataset.story
                this.renderSingleProfileStoryComments(triggeredEvent)

            }
        })
    }

    async renderSingleProfileStoryComments(triggeredEvent){

        this.getProfile(usernameOfCurrentPathname)
        .then(response=>{

            const profileStoriesData = response.self_stories

            // 點擊並展開留言內容後，讓特定storyId貼文的留言數量、留言按鈕listener失效
            // 防止重複的留言內容被呼叫並渲染
            if(!triggeredEvent.classList.contains("has-clicked")){
                
                document.querySelectorAll(`[data-story='${this.storyId}']`).forEach(element=>{
                    element.classList.add('has-clicked')
                })

                let profileStoryComments;
                profileStoriesData.forEach(data=>{
                    if(data.id === this.storyId){
                        profileStoryComments = data.comments
                    }
                })

                const comments = profileStoryComments.map(comment=>{
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
}

const profile = new Profile()
profile.getCurrentUserProfile()

function getCurrentUserProfile(){
    profile.getCurrentUserProfile();
}

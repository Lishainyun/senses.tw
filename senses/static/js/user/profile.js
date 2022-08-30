"use strict"

let loginStatus="";
let currentUserAvatar="";
let currentUserName="";
let currentUserBackground="";
let currentUserId="";

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
        const profileApiUrl = `http://44.199.90.64:8000/api/user/profile/${username}/`
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

        const CurrentUserProfileApiUrl = 'http://44.199.90.64:8000/api/user/profile/';
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
                
                getCurrentUserProfileReady = true
                
                this.loginStatus = loginStatus = '您已登入'
                this.currentUserId = currentUserId = response['user_id']
                this.currentUserAvatar = currentUserAvatar = response['avatar']
                this.currentUserBackground = currentUserBackground = response['background_image']
                this.currentUserName = currentUserName = response['username']
                
                this.currentUserBio = response['bio']
                this.currentUserIntro = response['intro']

                // render navbar avatar
                const avatar = response['avatar']
                renderNavbarAvatar(avatar)

                // when user is logged in, change navbar profile button href attribute
                // and avoid logged in user going to login page.
                redirectNavProfileBtnHrefToPersonal(currentUserName)
                redirectWhileLoadingForbiddenPage(currentUserName)

                // render page if user is on profile page
                if(currentPathnameSplitted[2] === 'profile'){
                    this.renderProfilePage()

                }

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
            if(currentPathnameSplitted[2] === 'profile'){
                this.renderProfilePage()

            }
        }
    }

    async renderProfilePage(){

        getProfileReady = false
        
        const personalInfoElement = document.querySelector('.personal-info') // inserted html element 

        this.getProfile(usernameOfCurrentPathname)
        .then(response=>{
            getProfileReady = true

            const data = response
            let background = data.background_image
            let avatar = data.avatar
            let username = data.username
            let intro = data.intro
            let bio = data.bio

            // check if the username extracted from pathname exists //

            // if not exist, render the error page
            if(response.error){

                const storiesBlocks = document.querySelector('stories-block')
                if(storiesBlocks){
                    storiesBlocks.style.display = 'none'
                }

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
                                        <img class="profile-background" src="${currentUserBackground}"></img>
                                        <img class="profile-avatar" src="${currentUserAvatar}"></img>
                                        <div class="profile-username">${currentUserName}</div>
                                        <div class="follow-block">
                                            <span class="following"></span>
                                            <span class="followers"></span>
                                        </div>
                                        <div class="profile-intro">${this.currentUserIntro}</div>
                                        <div class="editprofile-logout-block">
                                            <div class="edit-profile">編輯個人資料</div>
                                            <div class="logout">登出</div>
                                        </div>
                                        <div class="editblock">
                                            <p class="editblock-title"><i class="fa-solid fa-user-pen"></i> 編輯個人資料</p>
                                            <div class="editblock-close">X</div>
                                            <label class="editblock-changeusername-label" for="editblock-changeusername-input">變更使用者名稱</label>
                                            <input type="text" class="editblock-changeusername-input" id="editblock-changeusername-input" name="editblock-changeusername-input"/>
                                            <label class="editblock-changebg-label" for="editblock-changebg-input">變更背景圖片</label>
                                            <input type="file" accept="image/*" class="editblock-changebg-input" id="editblock-changebg-input" name="editblock-changebg-input"/>
                                            <label class="editblock-changeavatar-label" for="editblock-changeavatar-input">變更大頭貼</label>
                                            <input type="file" accept="image/*" class="editblock-changeavatar-input" id="editblock-changeavatar-input" name="editblock-changeavatar-input"/>
                                            <textarea class="editblock-changeIntro-input" id="editblock-changeIntro-input" name="editblock-changeIntro-input" placeholder="編輯簡介"></textarea><br/>
                                            <textarea class="editblock-changeBio-input" id="editblock-changeBio-input" name="editblock-changeBio-input" placeholder="編輯自我介紹"></textarea><br/>
                                            <div class="editblock-button" type="submit">編輯完成</div>
                                         </div>
                                        <div class="profile-bio">${this.currentUserBio}</div>
                                        `

                    personalInfoElement.insertAdjacentHTML('afterbegin', profileInfoHTML)

                    const profileLayout = document.querySelector('.profile-layout')
                    const profileTopUsernameHTML = `<div class="profile-top-username">${currentUserName}</div>`
                    profileLayout.insertAdjacentHTML('beforebegin', profileTopUsernameHTML)

                    // change stories-block width 
                    if(window.innerWidth > 1200 && usernameOfCurrentPathname === currentUserName){
                        document.querySelector('.stories-block').style.width = '60%'
                    }

                    // add listener for the logout btn
                    user.logoutUser()

                    followUtils.displayFollowBlock()

                } else{
                    const profileInfoHTML = `
                                            <img class="profile-background" src="${background}"></img>
                                            <img class="profile-avatar" src="${avatar}"></img>
                                            <div class="profile-username">${username}</div>
                                            <div class="follow" data-username=${username}>+ 追蹤</div>
                                            <div class="unfollow" data-username=${username}>取消追蹤</div>
                                            <div class="follow-block">
                                                <span class="following"></span>
                                                <span class="followers"></span>
                                            </div>
                                            <div class="profile-intro">${intro}</div>
                                            <div class="profile-bio">${bio}</div>
                                            `
                    personalInfoElement.insertAdjacentHTML('afterbegin', profileInfoHTML)

                    // change stories-block width
                    if(window.innerWidth > 1200 && usernameOfCurrentPathname === currentUserName){
                        document.querySelector('.stories-block').style.width = '60%'
                    }

                    followUtils.displayFollowBlock()

                }
            }
        })
        .catch(error=>{
            console.log(error)
        })
        .then(()=>{

            if(currentPathnameSplitted[3] === currentUserName){
                profileUtils.editProfileBtnListener()

            } else {
                followUtils.addListenerOnFollowUnfollowBtn()

            }
        })
        .catch(error=>{
            console.log(error)
        })

    }

    async editProfile(username, bg, avatar, intro, bio, userId){

        const token = localStorage.getItem('token')
        const data = new FormData()

        data.append('username', username)
        data.append('bg', bg)
        data.append('avatar', avatar)
        data.append('intro', intro)
        data.append('bio', bio)
        data.append('userId', userId)

        const headers = {
            'Authorization': 'Bearer ' + token
        }

        fetch('http://44.199.90.64:8000/api/user/profiles/', {
            method: 'PATCH',
            headers: headers,
            body: data,
            cache: 'no-cache'
        })
        .then(response=>response.json())
        .then(response=>{

            const username = response.data.username;
            window.location.replace(`/user/profile/${username}`);

        })
        .catch(error=>{
            console.log(error)
        })

    }

}

async function renderNavbarAvatar(avatarSRC){
    const navProfile = document.querySelectorAll('.navProfile')
    navProfile.forEach(ele=>{
        ele.src = avatarSRC
    })
}

const profile = new Profile()
profile.getCurrentUserProfile()

let getProfileReady = false
let getCurrentUserProfileReady = false


const profileUtils = {

    editProfileBtnListener(){
        const editProfileBtn = document.querySelector('.edit-profile')
        editProfileBtn.addEventListener('click', ()=>{
            document.querySelector('.editblock').classList.add('has-triggered')
            document.querySelector('.overlay').classList.add('has-triggered')

            document.querySelector('.editblock-close').onclick = ()=>{
                document.querySelector('.editblock').classList.remove('has-triggered')
                document.querySelector('.overlay').classList.remove('has-triggered')
            }

            document.querySelector('.editblock-button').onclick = () => {
                const username = document.querySelector('.editblock-changeusername-input').value
                const bg = document.querySelector('.editblock-changebg-input').files[0] || ""
                const avatar = document.querySelector('.editblock-changeavatar-input').files[0] || ""
                const intro = document.querySelector('.editblock-changeIntro-input'). value
                const bio = document.querySelector('.editblock-changeBio-input'). value
                const userId = currentUserId

                profile.editProfile(username, bg, avatar, intro, bio, userId)
            }
        })
    },

    
}
"use strict"

class Follow{

    followsListApiUrl = 'https://www.senses.tw/api/follows/'
    followApiUrl = 'https://www.senses.tw/api/follow/'
    followAddApiUrl = 'https://www.senses.tw/api/follows/add/'

    async getFollowList(username){

        const localStorageFollowData = localStorage.getItem(username)

        if(!localStorageFollowData){
            const response = await fetch(this.followsListApiUrl+`?user=${username}`, {
                method: 'GET',
                cache: 'no-cache',
            })

            return await response.json()

        } 

    }

    async saveFollowList(){

        const currentUserFollowData = localStorage.getItem(currentUserName)
        if(currentPathnameSplitted[1] === 'stories' && !currentUserFollowData){
            this.getFollowList(currentUserName)
            .then(response=>{
                saveFollowListFinished = true
                if(currentUserName !== undefined){
                    localStorage.setItem(currentUserName, JSON.stringify(response.data))

                }
            })
        } 
        
        saveFollowListFinished = true

    }

    async postFollow(follower, following){

        const token = localStorage.getItem('token')

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",    
            'Authorization': 'Bearer ' + token,
        }

        const body = {
            "follower": follower,
            "following": following,
            "username": currentUserName
        }

        const response = await fetch(this.followAddApiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            cache: 'no-cache',
        })

        return await response.json();
    }

    async follow(follower, following){
        this.postFollow(follower, following)
            .then(response=>{

                if(response.code === 'token_not_valid'){
                    window.location.href = `/user/login/`
                } else {
                    document.querySelector('.follow').style.display = 'none'
                    document.querySelector('.unfollow').style.display = 'block'

                    localStorage.removeItem(currentUserName)
    
                    let followersNum = parseInt(document.querySelector('.followers').innerHTML.split(" ")[0])
                    followersNum += 1
                    document.querySelector('.followers').innerHTML = `${followersNum} 粉絲`
                }

            })
            .catch(error=>{
                console.log(error)
            })

    }

    async deleteFollow(follower, following){

        const token = localStorage.getItem('token')

        const headers = {
            'Authorization': 'Bearer ' + token, 
        }

        const response = await fetch(this.followApiUrl+`?follower=${follower}&following=${following}&username=${currentUserName}`, {
            method: 'DELETE',
            headers: headers,
            cache: 'no-cache',
        })

        return await response.json()

    }

    async unfollow(follower, following){
        this.deleteFollow(follower, following)
            .then(response=>{
                document.querySelector('.follow').style.display = 'block'
                document.querySelector('.unfollow').style.display = 'none'

                let followersNum = parseInt(document.querySelector('.followers').innerHTML.split(" ")[0])
                followersNum -= 1
                document.querySelector('.followers').innerHTML = `${followersNum} 粉絲`

                localStorage.removeItem(follower)
                localStorage.removeItem(following)

            })
            .catch(error=>{
                console.log(error)
            })
    }
}

const follow = new Follow()
let saveFollowListFinished = false
let displayFollowBlockFinished = false

const followUtils = {

    addListenerOnFollowUnfollowBtn(){
        const followBtn = document.querySelector('.follow')
        const unfollowBtn = document.querySelector('.unfollow')
        
        followBtn.onclick = debounce(()=>{
            const following = followBtn.dataset.username
            const follower = currentUserName
            follow.follow(follower, following)
        }, 250)

        unfollowBtn.onclick = debounce(()=>{
            const following = unfollowBtn.dataset.username
            const follower = currentUserName
            follow.unfollow(follower, following)
        }, 250)


    },

    displayFollowBlock(){

        const username = usernameOfCurrentPathname
        if(localStorage.getItem(username)){
            localStorage.removeItem(username)
        }

        let data;
        let followers;
        let followersNum;
        let following;
        let followingNum;

        follow.getFollowList(username)
        .then(response=>{

            displayFollowBlockFinished = true

            data = response.data

            localStorage.setItem(username, JSON.stringify(data))

            followers = data.followerData.followerList
            followersNum = data.followerData.length
            following = data.followingData.followingList
            followingNum = data.followingData.length

            const followingEle = document.querySelector('.following')
            const followersEle = document.querySelector('.followers')
    
            followUtils.displayFollowing(followingEle, followingNum)
            followUtils.displayFollowers(followersEle, followersNum)
            
            let followersList = followers.map(follow=>{
                return follow.user_id
            })
    
            if(followersList.includes(currentUserId)){
    
                const unfollowEle = document.querySelector('.unfollow')
                if(unfollowEle){
                    unfollowEle.style.display = 'block'
                }
    
            } else {
    
                const followEle = document.querySelector('.follow')
                if(followEle){
                    followEle.style.display = 'block'
                }
    
            }        
        })
    },

    displayFollowing(followingEle, followingNum){
        followingEle.innerHTML = `${followingNum} 追蹤中`

            followingEle.onclick = ()=>{

                const username = usernameOfCurrentPathname

                follow.getFollowList(username)
                        .then(()=>{
                            const localStorageFollowData = localStorage.getItem(username)
                            const data = JSON.parse(localStorageFollowData)
                            const following = data.followingData.followingList
                            const followingNum = data.followingData.length

                            if(followingNum){
                                document.querySelector('.overlay').classList.add('has-triggered')

                                const followingBlockHTML = `<div class="following-block">
                                                                <div class="following-block-close">X</div>
                                                                <p class="following-title">追蹤中</p>
                                                            </div>`
                                
                                document.querySelector('.follow-block').insertAdjacentHTML('afterbegin', followingBlockHTML)
                
                                const followingUserHTML = following.map(ele=>{
                                    const username = ele.username
                                    const avatar = ele.avatar
                
                                    return  `
                                            <div class="following-users">
                                                <a href="/user/profile/${username}"><img class="following-avatar" src="${avatar}"/></a>
                                                <a href="/user/profile/${username}"><div class="following-username">${username}</div></a>
                                            </div>
                                            `
                                }).join("")
                
                                document.querySelector('.following-block').insertAdjacentHTML('beforeend', followingUserHTML)
                
                                // add listener for close btn
                                const closeBtn = document.querySelector('.following-block-close')
                                closeBtn.addEventListener('click', (event)=>{
                                    event.target.parentNode.remove()
                                    document.querySelector('.overlay').classList.remove('has-triggered')
                
                                })
                            }                        
                        })
                        .catch(error=>{
                            console.log(error)
                        })
            }

    },

    displayFollowers(followersEle, followersNum){
        followersEle.innerHTML = `${followersNum} 粉絲`

        followersEle.onclick = ()=>{

            const username = usernameOfCurrentPathname

            follow.getFollowList(username)
                    .then(()=>{

                        const localStorageFollowData = localStorage.getItem(username)
                        const data = JSON.parse(localStorageFollowData)
                        const followers = data.followerData.followerList
                        const followersNum = data.followerData.length

                        if(followersNum){
                            document.querySelector('.overlay').classList.add('has-triggered')

                            const followersBlockHTML = `<div class="followers-block">
                                                            <div class="followers-block-close">X</div>
                                                            <p class="followers-title">粉絲</p>
                                                        </div>`
                            
                            document.querySelector('.follow-block').insertAdjacentHTML('afterbegin', followersBlockHTML)
                
                            const followersUserHTML = followers.map(ele=>{
                                const username = ele.username
                                const avatar = ele.avatar
                
                                return  `
                                        <div class="followers-users">
                                            <a href="/user/profile/${username}"><img class="followers-avatar" src="${avatar}"/></a>
                                            <a href="/user/profile/${username}"><div class="followers-username">${username}</div></a>
                                        </div>
                                        `
                            }).join("")
                
                            document.querySelector('.followers-block').insertAdjacentHTML('beforeend', followersUserHTML)
                
                            // add listener for close btn
                            const closeBtn = document.querySelector('.followers-block-close')
                            closeBtn.addEventListener('click', (event)=>{
                                event.target.parentNode.remove()
                                document.querySelector('.overlay').classList.remove('has-triggered')
                
                            })
                        }
                    })
                    .catch(error=>{
                        console.log(error)
                    })
        }
    },

}
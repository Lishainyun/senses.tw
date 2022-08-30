"use strict"    

class Like{

    likeListApiUrl = 'http://127.0.0.1:8000/api/likes/'
    likeApiUrl = 'http://127.0.0.1:8000/api/like/'
    likeAddApiUrl = 'http://127.0.0.1:8000/api/likes/add/'

    async getSingleLike(kwargs){

        const token = localStorage.getItem('token')
        const storyId = kwargs.storyId || null
        const commentId = kwargs.commentId || null
        const userId = kwargs.userId || null

        const headers = {
            'Authorization': 'Bearer ' + token
        }

        const response = await fetch(this.likeApiUrl+`?storyId=${storyId}&commentId=${commentId}&userId=${userId}`, {
            headers: headers,
            method: 'GET',
            cache: 'no-cache',
        })

        return await response.json();

    }

    async getLikesList(kwargs){

        const storyId = kwargs.storyId || ""
        const commentId = kwargs.commentId || ""
        const page = kwargs.page || ""
        const userId = kwargs.userId || ""

        const response = await fetch(this.likeListApiUrl+`?storyId=${storyId}&commentId=${commentId}&page=${page}&userId=${userId}`, {
            method: 'GET',
            cache: 'no-cache',
        })

        return await response.json();

    }

    async postLike(kwargs){

        const token = localStorage.getItem('token')
        const storyId = kwargs.storyId || null
        const commentId = kwargs.commentId || null
        const userId = kwargs.userId || null

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",    
            'Authorization': 'Bearer ' + token,
        }

        const body = {
            "storyId": storyId,
            "commentId": commentId,
            "userId": userId,
        }

        const response = await fetch(this.likeAddApiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            cache: 'no-cache',
        })

        return await response.json();

    }

    async renderLikesList(likesNumEle, response, flag){

        const data = response.data
        const nextPage = response.nextPage

        // trigger overlay
        const overlay = document.querySelector('.overlay')
        if(!overlay.classList.contains('has-triggered')){
            overlay.classList.add('has-triggered')
        }

        // render dom
        if(flag === 'storyFlag'){

            const eleForInsertingStoriesLikeslistWrapper = likesNumEle.parentNode.parentNode
            this.renderLikeslistDOM(eleForInsertingStoriesLikeslistWrapper, overlay, data, nextPage)

        } else if(flag === 'commentFlag'){

            const eleForInsertingCommentsLikeslistWrapper =  likesNumEle.parentNode.parentNode.parentNode.parentNode.parentNode
            this.renderLikeslistDOM(eleForInsertingCommentsLikeslistWrapper, overlay, data, nextPage)

        } else {

            const eleForInsertingCommentsOfCommentLikeslistWrapper = likesNumEle.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode
            this.renderLikeslistDOM(eleForInsertingCommentsOfCommentLikeslistWrapper, overlay, data, nextPage)

        }

    }

    async renderLikeslistDOM(wrapper, overlay, data, nextPage){
        // render likes list
        const likeslistWrapper = document.querySelector('.likeslist-wrapper')
        if(!likeslistWrapper){
            const wrapperHTML = `
                                <div class="likeslist-wrapper">
                                    <div class="likeslist-close">X</div>
                                    <p class="likeslist-title">喜歡這篇故事的人們</p>
                                </div>
                                `
            wrapper.insertAdjacentHTML('afterbegin', wrapperHTML)

            // insert users
            const eleForInsertingLikeslist = document.querySelector('.likeslist-wrapper')

            if(currentPathnameSplitted.includes('profile')){
                eleForInsertingLikeslist.classList.add('profile')
            }

            data.forEach(data=>{
                const username = data.user.username
                const avatar = data.user.avatar
                const likeslistHTML = `
                                    <div class="likeslist-users">
                                        <a href="/user/profile/${username}"><img class="likeslist-avatar" src="${avatar}"/></a>
                                        <a href="/user/profile/${username}"><div class="likeslist-username">${username}</div></a>
                                    </div>
                                    `
                eleForInsertingLikeslist.insertAdjacentHTML('beforeend', likeslistHTML)
            })

            if(nextPage){
                const nextPage = `
                                <div class="likeslist-displaymore">......顯示更多</div>
                                `
                eleForInsertingLikeslist.insertAdjacentHTML('beforeend', nextPage)

            }

            // add listener for close btn
            const closeBtn = document.querySelector('.likeslist-close')
            closeBtn.addEventListener('click', (event)=>{
                event.target.parentNode.remove()
                overlay.classList.remove('has-triggered')

            })

        }        
    }

    async addLike(kwargs){
        this.postLike(kwargs)
            .then(response=>{
                console.log(response.message)
            })
            .catch(error=>{
                console.log(error)
            })
    }

    async deleteLike(kwargs){

        const token = localStorage.getItem('token')
        const storyId = kwargs.storyId || null
        const commentId = kwargs.commentId || null
        const userId = kwargs.userId || null

        const headers = {
            'Authorization': 'Bearer ' + token, 
        }

        fetch(this.likeApiUrl+`?storyId=${storyId}&commentId=${commentId}&userId=${userId}`, {
            method: 'DELETE',
            headers: headers,
            cache: 'no-cache',
        })
        .then(res=>res.json())
        .then(res=>{
            console.log(res.message)
        })
        .catch(error=>{
            console.log(error)
        })

    }

    async changeLikeBtnsBgColorIfUserLiked(response){

        if(response){

            const data = response.data
        
            data.forEach(res=>{
                if(res.story){
                    currentUserLikesList.push(res.story.id)
                } else {
                    currentUserLikesList.push(res.comment.id)
                }
            })
    
            const likeBtnEles = document.querySelectorAll('.stories-click-like')
            likeBtnEles.forEach(ele=>{
                if([...currentUserLikesList].indexOf(ele.dataset.storyid) !== -1){
                    ele.classList.add('has-clicked')
                }
            })

            changeLikeBtnsBgColorIfUserLikedFinished = true

        } else {

            const commentLikeBtnEles = document.querySelectorAll('.comment-like')
            commentLikeBtnEles.forEach(ele=>{
                if([...currentUserLikesList].indexOf(ele.dataset.commentid) !== -1){
                    ele.classList.add('has-clicked')
                }        
            })

            changeLikeBtnsBgColorIfUserLikedFinished = true
        }
    }

}

const like = new Like()

let LikeidPagePairs = {}
let currentUserLikesList = []
let changeLikeBtnsBgColorIfUserLikedFinished = false
let addStoreisLikeBtnsClickListenerFinished = false
let addStoreisLikesClickListenerFinished = false


const likeUtils = {

    addStoreisLikesClickListener: () => {
        document.querySelectorAll('.stories-likes').forEach(ele=>{
            ele.addEventListener("click", debounce(()=>{

                const currentLikesNum = parseInt(ele.lastElementChild.innerHTML)
                const storyId = ele.dataset.storyid
                LikeidPagePairs.storyId = 0

                if(currentLikesNum !== 0){
                    like.getLikesList({'storyId': storyId, 'page': `${LikeidPagePairs.storyId}`})
                    .then(response=>{
                        like.renderLikesList(ele, response, 'storyFlag')
                    })
                    .catch(error=>{
                        console.log(error)
                    })
                }


            }, 250))
        })

        addStoreisLikesClickListenerFinished = true
    },

    addCommentsLikesClickListener: () => {
        document.querySelectorAll('.comment-likes-num').forEach(ele=>{
            
            ele.addEventListener("click", debounce(()=>{

                const currentLikesNum = parseInt(ele.innerHTML)
                const commentId = ele.dataset.commentid
                LikeidPagePairs.commentId = 0

                if(currentLikesNum !== 0){
                    like.getLikesList({'commentId': commentId, 'page': `${LikeidPagePairs.commentId}`})
                    .then(response=>{
                        like.renderLikesList(ele, response, 'commentFlag')
                    })
                    .catch(error=>{
                        console.log(error)
                    })
                }


            }, 250))
        })
    },

    addCommentsOfCommentLikesClickListener: () => {
        document.querySelectorAll('.comment-likes-num').forEach(ele=>{
            
            ele.addEventListener("click", debounce(()=>{

                const currentLikesNum = parseInt(ele.innerHTML)
                const commentId = ele.dataset.commentid

                LikeidPagePairs.commentId = 0

                if(currentLikesNum !== 0){
                    like.getLikesList({'commentId': commentId, 'page': `${LikeidPagePairs.commentId}`})
                    .then(response=>{
                        like.renderLikesList(ele, response, 'commentOfCommentFlag')
                    })
                    .catch(error=>{
                        console.log(error)
                    })
                }


            }, 250))
        })
    },

    addStoreisLikeBtnsClickListener: () => {

        const likeBtns = document.querySelectorAll('.stories-click-like')

        likeBtns.forEach(btn=>{

            const storyId = btn.dataset.storyid
            const userId = currentUserId

            let likesNumEle = btn.parentNode.previousElementSibling.previousElementSibling.lastElementChild
            let likesNum;
            if(likesNumEle){
                likesNum = parseInt(likesNumEle.innerHTML)
            }

            btn.onclick = debounce(()=>{
                if(currentUserLikesList.indexOf(storyId) !== -1){
                    const storyIdIndex = currentUserLikesList.indexOf(storyId)

                    currentUserLikesList.splice(storyIdIndex, 1)

                    btn.classList.remove('has-clicked')

                    likesNumEle.innerHTML = likesNum -= 1
    
                    like.deleteLike({
                        "storyId": storyId,
                        "userId": userId
                    })


                } else {
                    currentUserLikesList.push(storyId)

                    btn.classList.add('has-clicked')
    
                    likesNumEle.innerHTML = likesNum += 1
    
                    like.addLike({
                        "storyId": storyId,
                        "userId": userId,
                    })

                }

            },250)

        })

        addStoreisLikeBtnsClickListenerFinished = true

    },

    addCommentsLikeBtnsClickListener: () => {

        const likeBtns = document.querySelectorAll('.comment-like')

        likeBtns.forEach(btn=>{

            const commentId = btn.dataset.commentid
            const userId = currentUserId

            let likesNumEle = btn.previousElementSibling
            let likesNum;
            if(likesNumEle){
                likesNum = parseInt(likesNumEle.innerHTML.split(' ')[0])
            }

            btn.onclick = debounce(()=>{
                if(currentUserLikesList.indexOf(commentId) !== -1){
                    const commentIdIndex = currentUserLikesList.indexOf(commentId)

                    currentUserLikesList.splice(commentIdIndex, 1)

                    btn.classList.remove('has-clicked')

                    // if likesNum will be reduced to 0
                    if(likesNum === 1){
                        likesNumEle.style.display = "none"
                    }

                    likesNumEle.innerHTML = (likesNum -= 1) + " 個喜歡"
    
                    like.deleteLike({
                        "commentId": commentId,
                        "userId": userId
                    })
                } else {
                    currentUserLikesList.push(commentId)
                    btn.classList.add('has-clicked')

                    likesNumEle.innerHTML = (likesNum += 1) + " 個喜歡"
                    likesNumEle.style.display = "inline-block"

                    like.addLike({
                        "commentId": commentId,
                        "userId": userId,
                    })
                }

            },250)

        })

    },

    getUserLikeslist(){

        like.getLikesList({'userId': currentUserId})
        .then(response=>{
            console.log(response)
            localStorage.setItem('likeslist', JSON.stringify(response.data))
            
            like.changeLikeBtnsBgColorIfUserLiked(response)
            likeUtils.addStoreisLikeBtnsClickListener()
        })
        .catch(error=>{
            console.log(error)
        })

    }

}

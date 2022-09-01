"use strict"


function renderWholePage(page, keyword){

    displayLoader()
    
    const renderStories = window.setInterval(()=>{

        if(currentUserName){

            clearInterval(renderStories)

            story.renderStories(page, keyword)
            follow.saveFollowList()
        
        } 

    }, 50)

    const addOtherUtils = window.setInterval(()=>{

        if(renderStoreisFinished && saveFollowListFinished){

            clearInterval(addOtherUtils)

            likeUtils.getUserLikeslist()
            likeUtils.addStoreisLikesClickListener()
            storyUtils.displayFollowingUsersActivities()


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

        }

    }, 50)

    const interval = window.setInterval(()=>{

        if(currentPathnameSplitted[1] === 'stories'){

            if (changeLikeBtnsBgColorIfUserLikedFinished && addStoreisLikeBtnsClickListenerFinished && addStoreisLikeBtnsClickListenerFinished
                && displayFollowingUsersActivitiesFinished && addPreviewsFinished){

                    storyUtils.hideOverflowTexts()
                    closeLoader()

                    clearInterval(interval)

            } 

        } else {

            if (changeLikeBtnsBgColorIfUserLikedFinished && addStoreisLikeBtnsClickListenerFinished && addStoreisLikeBtnsClickListenerFinished
                && displayFollowBlockFinished && displayFollowingUsersActivitiesFinished && addPreviewsFinished){
                    
                    storyUtils.hideOverflowTexts()
                    closeLoader()

                    clearInterval(interval)

            } 

        }

    }, 50)

    const displayContent = window.setInterval(()=>{
        if (!document.querySelector('.loader-wrapper')){

            if(currentPathnameSplitted[2] === 'profile' && currentPathnameSplitted[3] === currentUserName){
                document.querySelector('.stories-add-block').style.display = 'block'
            } else if (currentPathnameSplitted[2] === 'profile' && currentPathnameSplitted[3] !== currentUserName){
                document.querySelector('.profile-info-block').remove()
            } else {
                document.querySelector('.stories-add-block').style.display = 'block'   
            }

            const storiesWrap = document.querySelectorAll('.render-stories-wrap')
            storiesWrap.forEach(ele=>{
                ele.style.display = 'block'

            })       

            window.clearInterval(displayContent)
        }
    }, 50)

}

// check if user is on story page. 
// If true, trigger renderStories method

if(currentPathnameSplitted[1] === 'stories'){

    if(!currentPathnameSplitted[2]){

        // main story page
        const token = localStorage.getItem('token')

        if(token){
            let page = 0;
            let keyword = "";
    
            renderWholePage(page, keyword)
        } else {
            window.location.replace('/user/login')   
        }

    } else {

        // single story page
        const token = localStorage.getItem('token')

        if(token){

            let page = 0;
            let keyword = currentPathnameSplitted[2];
    
            renderWholePage(page, keyword)

        } else {

            window.location.replace('/user/login')   
    
        }

    }

} else if(currentPathnameSplitted[2] === 'profile'){

    // profile page
    const token = localStorage.getItem('token')

    if(token){
        let page = 0;
        let keyword = "";
    
        renderWholePage(page, keyword)
    } else {
        window.location.replace('/user/login')   

    }

} 
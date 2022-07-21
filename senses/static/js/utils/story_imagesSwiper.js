"use strict"

let photoWrapperEleList = [];
let xAnchorPoint;
let locked = false;
let windowInnerWidth;

const refreshPhotoWrapperEleList = function(){

    photoWrapperEleList = document.querySelectorAll('.stories-image-wrapper')

    console.log('photoWrapperEleList refreshed')

}

// get window inner width for 
function getWindowInnerWidth(){
    windowInnerWidth = window.innerWidth
}

getWindowInnerWidth()

function lock(photoWrapperEle){
    return function(event){
        xAnchorPoint = unify(event).clientX
        photoWrapperEle.classList.toggle('smooth', !(locked = true))
    }

};

window.addEventListener('resize', getWindowInnerWidth, false)


function move(photoWrapperEle, photoNums){
    return function(event){
        const xDropPoint = unify(event).clientX
        let previousPhotoIndex = parseInt(getComputedStyle(event.target).getPropertyValue('--i'));
        const photoSwiperDotNodes = event.target.nextElementSibling.childNodes
    
        if(locked){
            let xTravelDistance = xDropPoint - xAnchorPoint; 
            // if xTravelDistance is positive then the value of
            // this variable must be +1, otherwise -1.
            let signValue = Math.sign(xTravelDistance); 
            let swipeDistance = +(signValue*xTravelDistance/windowInnerWidth).toFixed(2)
            

            if((previousPhotoIndex > 0 || signValue < 0) && (previousPhotoIndex < photoNums - 1 || signValue > 0) && swipeDistance > 0.1){

                swipeDistance = 1 - swipeDistance
                event.target.style.setProperty('--i', previousPhotoIndex -= signValue);

                // add classlist `has-selected` to current photo swiper dot
                if(signValue < 0){
                    const currentPhotoIndex = previousPhotoIndex // cuz previousPhotoIndex has already been calculated to become the current photo index
                    const currentPhotoEle = photoSwiperDotNodes[currentPhotoIndex]
                    const previousPhotoEle = currentPhotoEle.previousElementSibling
                    
                    previousPhotoEle.classList.remove('has-selected')
                    currentPhotoEle.classList.add('has-selected')
                }else{
                    const currentPhotoIndex = previousPhotoIndex // cuz previousPhotoIndex has already been calculated to become the current photo index
                    const currentPhotoEle = photoSwiperDotNodes[currentPhotoIndex]
                    const nextPhotoEle = currentPhotoEle.nextElementSibling

                    nextPhotoEle.classList.remove('has-selected')
                    currentPhotoEle.classList.add('has-selected')
                }
    
            }

            photoWrapperEle.style.setProperty('--tx', '0px');
            photoWrapperEle.style.setProperty('--swipeDistance', swipeDistance);
            photoWrapperEle.classList.toggle('smooth', !(locked = false));
            xAnchorPoint = null;
    
        }
    }

};

function drag(photoWrapperEle){
    return function(event){
        event.preventDefault()

        if(locked){
            photoWrapperEle.style.setProperty('--tx', `${Math.round(unify(event).clientX - xAnchorPoint)}px`)
        }
    }

}

function unify(event){ 
    return event.changedTouches ? event.changedTouches[0] : event 
};

function createPhotoSwiperDots(photoWrapperEle, photoNums){
    const photoSwiperDotsWrapper = document.createElement('div');
    photoSwiperDotsWrapper.className = 'photoSwiperDotsWrapper'
    photoWrapperEle.insertAdjacentElement('afterend', photoSwiperDotsWrapper)

    const firstPhotoSwipeDot = `<span class="photoSwiperDot has-selected">&#x2022;<span>`
    photoSwiperDotsWrapper.insertAdjacentHTML('afterbegin', firstPhotoSwipeDot)

    for(let i = 0 ; i < photoNums-1 ; i++){
        const photoSwiperDot = `<span class="photoSwiperDot">&#x2022;<span>`
        photoSwiperDotsWrapper.insertAdjacentHTML('beforeend', photoSwiperDot)
    }


}

const addEventToAllPhotoWrapper = function(event){

    clearTimeout(photoWrapperEleList)

    photoWrapperEleList.forEach(photoWrapperEle=>{
        
        const photoNums = photoWrapperEle.children.length;

        if(photoNums !== 0){
            photoWrapperEle.style.setProperty('--photoNums', photoNums)

            photoWrapperEle.addEventListener('mousedown', lock(photoWrapperEle, photoNums), false);
            photoWrapperEle.addEventListener('touchstart', lock(photoWrapperEle, photoNums), false);

            photoWrapperEle.addEventListener('mouseup', move(photoWrapperEle, photoNums), false);
            photoWrapperEle.addEventListener('touchend', move(photoWrapperEle, photoNums), false);

            photoWrapperEle.addEventListener('mousemove', drag(photoWrapperEle, photoNums), false);
            photoWrapperEle.addEventListener('touchmove', drag(photoWrapperEle, photoNums), false);
        } else {
            photoWrapperEle.classList.add('has-no-image')
        }

        if(photoNums>1)
        createPhotoSwiperDots(photoWrapperEle, photoNums)
    }) 

    closeStoriesLoader()

    //display stories-block
    const storiesBlockEle = document.querySelector('.stories-block')
    storiesBlockEle.style.display = 'block'

}

const displayRenderStoriesWrap = function(){
    const renderStoriesWrapEle = document.querySelectorAll('.render-stories-wrap')
    renderStoriesWrapEle.forEach(ele=>{
        ele.style.display = 'block'
    })
}


window.setTimeout(()=>{

    refreshPhotoWrapperEleList()

    addEventToAllPhotoWrapper()

}, 1000)







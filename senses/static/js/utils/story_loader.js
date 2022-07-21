"use strict"
const loaderWrapper = `<div class="loader-wrapper"></div>`
const storiesLoader = `<div class="render-stories-wrap loader">
                            <div class="stories-avatar loader"></div>
                            <div class="stories-username loader"></div>
                            <div class="stories-time loader"></div>
                            <div class="stories-text loader-1"></div>
                            <div class="stories-text loader-2"></div>
                            <div class="stories-text loader-3"></div>
                        </div>`

function displayStoriesLoader(){

    const layout = document.querySelectorAll('.tags-block')
    layout.forEach(layout=>{
        layout.insertAdjacentHTML('afterend', loaderWrapper)
    })

    const loaderWrapperEle = document.querySelectorAll('.loader-wrapper')
    loaderWrapperEle.forEach(ele=>{
        for(let i = 0; i < 11; i++){
            ele.insertAdjacentHTML('afterbegin', storiesLoader)
        }
    })


}

function closeStoriesLoader(){
    const loaderWrapperEle = document.querySelectorAll('.loader-wrapper')
    loaderWrapperEle.forEach(ele=>{
        ele.style.display = "none"
    })

}

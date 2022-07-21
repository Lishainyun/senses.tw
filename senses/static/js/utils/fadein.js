"user strict"

let elesForTriggeringFadeinBlock = [];

const pushEleToEnabledList = (() => {

    // add stories-add button
    const storiesAddBlockBtn = document.querySelectorAll('.stories-addblock-button')
    if(storiesAddBlockBtn && storiesAddBlockBtn.length !== 0){
        storiesAddBlockBtn.forEach(btn=>{
            elesForTriggeringFadeinBlock.push(btn)
        })
    }

    // add stories-edit button
    const storiesEditBtn = document.querySelectorAll('.stories-addblock-button')
    if(storiesAddBlockBtn && storiesAddBlockBtn.length !== 0){
        storiesAddBlockBtn.forEach(btn=>{
            elesForTriggeringFadeinBlock.push(btn)
        })
    }

})()

const renderFadeIns = (...kwargs) => {
    kwargs.forEach(arg=>{
        arg.classList.add('has-triggered')
    })

}

function addListenerToelesForTriggeringFadeinBlock(elesForTriggeringFadeinBlock){

    elesForTriggeringFadeinBlock.forEach(ele=>{
        ele.addEventListener('click', ()=>{

            const overlay = document.querySelector('.overlay')
            const fadeInele = ele.nextElementSibling

            renderFadeIns(overlay, fadeInele)

        })
    })

}

addListenerToelesForTriggeringFadeinBlock(elesForTriggeringFadeinBlock)
"use strict"

const fadeinBlockCloseEle = [...document.querySelectorAll('.fadein-block-close')]
let closeTargets = []

// close story add block 
fadeinBlockCloseEle.forEach(ele=>{

    ele.addEventListener('click', (event)=>{

        const triggeredOverlay = document.querySelector('.overlay.has-triggered')
        const triggeredBlock = ele.parentNode
        closeTargets = [triggeredOverlay, triggeredBlock]

        closeTargets.forEach(target=>{
            target.classList.remove('has-triggered')
        })

        // clear text input
        const inputText = document.querySelector('.form-text-content-input')
        if(inputText.value !== ""){
            inputText.value = ""
        }

        // clear preview images
        const imageContentInputBtn = document.querySelector('.form-image-content-input')
        const imagePreview =document.querySelector('.image-preview-wrapper').children
        if(imagePreview){
            deletePreviews(event, imageContentInputBtn)
        }
        
        // recover changes to fit adding use rather than editing use
        const addTitle = document.querySelector('.fadein-block-title')
        const editTitle = document.querySelector('.fadein-edit-title')
        if(getComputedStyle(addTitle).display === "none"){
            addTitle.style.display = "block"
            editTitle.style.display = "none"
        }

        const addbtn = document.querySelector('.addblock-submit-button')
        const editbtn = document.querySelector('.fadein-edit-button')
        if(getComputedStyle(addbtn).display === "none"){
            addbtn.style.display = "block"
            editbtn.style.display = "none"
        }


        // clear all elements inside close targets list
        closeTargets = []

    })

})



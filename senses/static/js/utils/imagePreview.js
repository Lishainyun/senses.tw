"use strict"

//add preview
let imagesReadyForUploading = [];
let commentImageReadyForUploading;
let commentImageOnCommentReadyForUploading;
let commentImageBlobURL;
let addPreviewsFinished = false

function addPreviews(kwargs){

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////// add block ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const imageContentInputBtn = kwargs.imageContentInputBtn

    const imagePreviewWrapper = document.querySelector('.image-preview-wrapper')

    if(imageContentInputBtn){
        imageContentInputBtn.onchange = () =>{
            const images = [...imageContentInputBtn.files]

            if(images.length !== 0){
    
                images.forEach(image=>{
                    imagesReadyForUploading.push(image)
                })
    
                imagePreviewWrapper.classList.add('has-previewImage')
    
                images.forEach(image=>{
    
                    const imageName = image.name
    
                    const renderedHtml = `
                                          <span class="preview-images-delete">X</span>
                                          <img class="image-preview" data-imagename="${imageName}"/>
                                         `
                    imagePreviewWrapper.insertAdjacentHTML('afterbegin', renderedHtml)
    
                    const imagePreview = document.querySelector('.image-preview')
                    const imageBlobUrl = window.URL.createObjectURL(image)
                    imagePreview.src = imageBlobUrl
    
                })
    
                // add deletePreviews feature to every preview pic
                deletePreviews(event, {'imageContentInputBtn':imageContentInputBtn})
            }   
        }

        addPreviewsFinished = true
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////// comment image ////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const commentImageInputBtns = [...document.querySelectorAll('.write-comment-input-image')]

    if(commentImageInputBtns && commentImageInputBtns.length !== 0){

        commentImageInputBtns.forEach(btn=>{
            btn.onchange = event => {
                
                // check whether the comment already has preivew image
                if(commentImageReadyForUploading){

                    // revoke previous object before creating new one
                    const commentImagePreview = document.querySelectorAll('.comment-image-preview')
                    commentImagePreview.forEach(preview=>{
                        const url = preview.src
                        const deleteBtn = preview.previousElementSibling
                        URL.revokeObjectURL(url)     
                        preview.remove()
                        deleteBtn.remove()
                    })
                    
                    commentImageReadyForUploading === ""

                    document.querySelectorAll('.comment-image-preview-wrapper.has-previewImage').forEach(ele=>{
                        ele.classList.remove('has-previewImage')
                        ele.parentNode.style.display = 'none'
                    })
                }
    
                const image = event.target.files[0]    
                commentImageReadyForUploading = image
                                
                const writeCommentWrapperEle = event.target.parentNode
                const commentImagePreviewWrapper = event.target.parentNode.firstElementChild
                writeCommentWrapperEle.style.gridTemplateRows = "260px";
    
                commentImagePreviewWrapper.classList.add('has-previewImage')
    
                const imageName = image.name
    
                const renderedHtml = `
                                    <span class="comment-preview-images-delete">X</span>
                                    <img class="comment-image-preview" data-imagename="${imageName}"/>
                                    `
                commentImagePreviewWrapper.insertAdjacentHTML('afterbegin', renderedHtml)
                    
                const commentImagePreview = writeCommentWrapperEle.firstElementChild.lastElementChild
                const commentImageBlobUrl = window.URL.createObjectURL(image)
                commentImageBlobURL = commentImageBlobUrl
                commentImagePreview.src = commentImageBlobUrl
                    
                // add deletePreviews feature to every preview pic
                deletePreviews(event, {'commentImageInputBtn':kwargs.commentImageInputBtn})
            }
        })

        addPreviewsFinished = true

    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////  comment image on comment////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    const commentImageInputCommentBtns = [...document.querySelectorAll('.write-comment-input-image-comment')]

    if(commentImageInputCommentBtns && commentImageInputCommentBtns.length !== 0){

        commentImageInputCommentBtns.forEach(btn=>{
            btn.onchange = event => {
                
                // check whether the comment already has preivew image
                if(commentImageOnCommentReadyForUploading){

                    // revoke previous object before creating new one
                    const commentImagePreview = document.querySelectorAll('.comment-image-preview-comment')
                    commentImagePreview.forEach(preview=>{
                        const url = preview.src
                        const deleteBtn = preview.previousElementSibling
                        URL.revokeObjectURL(url)     
                        preview.remove()
                        deleteBtn.remove()
                    })
                    
                    commentImageOnCommentReadyForUploading === ""

                    document.querySelectorAll('.comment-image-preview-wrapper-comment.has-previewImage').forEach(ele=>{
                        ele.classList.remove('has-previewImage')
                        ele.parentNode.style.display = 'none'
                    })
                }
    
                const image = event.target.files[0]    
                commentImageOnCommentReadyForUploading = image
                                
                const writeCommentWrapperEle = event.target.parentNode
                const commentImagePreviewWrapper = event.target.parentNode.firstElementChild
                writeCommentWrapperEle.style.gridTemplateRows = "260px";
    
                commentImagePreviewWrapper.classList.add('has-previewImage')
    
                const imageName = image.name
    
                const renderedHtml = `
                                    <span class="comment-preview-images-delete-comment">X</span>
                                    <img class="comment-image-preview-comment" data-imagename="${imageName}"/>
                                    `
                commentImagePreviewWrapper.insertAdjacentHTML('afterbegin', renderedHtml)
                    
                const commentImagePreview = writeCommentWrapperEle.firstElementChild.lastElementChild
                const commentImageBlobUrl = window.URL.createObjectURL(image)
                commentImageBlobURL = commentImageBlobUrl
                commentImagePreview.src = commentImageBlobUrl
                    
                // add deletePreviews feature to every preview pic
                deletePreviews(event, {'commentOfCommentImageInputBtn':kwargs.commentOfCommentImageInputBtn})
            }
        })
        
        addPreviewsFinished = true

    }    

}

// delete preview of images would be uploaded later 
function deletePreviews(event, kwargs){

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////// add block ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////
    const previewImagesDeleteEle = [...document.querySelectorAll('.preview-images-delete')]
    let DeleteEleCount = previewImagesDeleteEle.length

    // if this function is called by triggering close btn
    const closeBtn = document.querySelector('.fadein-block-close')
    if(event.target === closeBtn){
        
        DeleteEleCount=0;
        imagesReadyForUploading = []

        const imagePreviewWrapperHasPreivew = document.querySelector('.image-preview-wrapper.has-previewImage')
        if(imagePreviewWrapperHasPreivew){
            const previews = [...imagePreviewWrapperHasPreivew.children]
            
            previews.forEach(preview=>{
                
                if(preview.className === 'image-preview'){
                    const blobObjectUrl = preview.src
                    URL.revokeObjectURL(blobObjectUrl)
                }
    
    
                preview.remove()
            })
        
            imagePreviewWrapperHasPreivew.classList.remove('has-previewImage')
        }

    }

    // or is called by delete btn
    if(DeleteEleCount !== 0){

        // push original images to ready list
        const originalImagesEle = kwargs.originalImagesEle
        
        if(originalImagesEle && originalImagesEle.length !== 0){
            originalImagesEle.forEach(ele=>{
                imagesReadyForUploading.push(ele)

            })
        }

        previewImagesDeleteEle.forEach(ele=>{
            
            ele.onclick = () => {
                
                DeleteEleCount-=1;

                const deletedImageEle = ele.nextElementSibling

                // handle original photos of the story
                if(deletedImageEle.dataset.imagesrc){
                    
                    const index = imagesReadyForUploading.indexOf(deletedImageEle)
                    if(index !== -1){
                        imagesReadyForUploading.splice(index, 1)
                    }
                }

                
                // handle uploaded, new photos
                const imageContentInputBtn = kwargs.imageContentInputBtn
                const images = []
                if(imageContentInputBtn){
                    const filelist = [...imageContentInputBtn.files]
                    filelist.forEach(file=>{
                        images.push(file)
                    })
                }

                if(images && images.length !== 0){
                    images.forEach(image=>{
                        if(image.name === deletedImageEle.dataset.imagename){
                            const index = imagesReadyForUploading.indexOf(image)
                            if(index !== -1){
                                imagesReadyForUploading.splice(index, 1)
                            }
                        }
                    })
                }

                
                const removedElementList = [ele, deletedImageEle]
                
                if(removedElementList.length !== 0){
                    removedElementList.forEach(ele=>{

                        ele.remove();
    
                    })
                }

                const urlSliced = deletedImageEle.src.slice(0, 4)
                if(urlSliced && urlSliced === 'blob'){
                    const blobObjectUrl = deletedImageEle.src
                    URL.revokeObjectURL(blobObjectUrl)
                }

                if(DeleteEleCount === 0){
                    const imagePreviewWrapper = document.querySelector('.image-preview-wrapper.has-previewImage')
                    imagePreviewWrapper.classList.remove('has-previewImage')
                }
            }

        })       
    }

    //////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// comment image ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////

    const commentPreviewImagesDeleteEle = document.querySelectorAll('.comment-preview-images-delete')

    if(commentPreviewImagesDeleteEle && commentPreviewImagesDeleteEle.length !== 0){
        commentPreviewImagesDeleteEle.forEach(ele=>{
            ele.onclick = event => {  
        
                const commentImageContentInputBtn = ele.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling
                commentImageContentInputBtn.value = ""
                commentImageReadyForUploading = ""
    
                // clear space of write-comment-wrapper
                const writeCommentWrapperEle = ele.parentNode.parentNode
                writeCommentWrapperEle.style.gridTemplateRows = "";
    
                // clear preview eles
                const commentDeletedImageEle = ele.nextElementSibling
                const removedElementList = [ele, commentDeletedImageEle]
                            
                if(removedElementList.length !== 0){
                    removedElementList.forEach(ele=>{
                        ele.remove();
                    })
                }
    
                // revoke ObjectURL
                const urlSliced = commentDeletedImageEle.src.slice(0, 4)
                if(urlSliced && urlSliced === 'blob'){
                    const blobObjectUrl = commentDeletedImageEle.src
                    URL.revokeObjectURL(blobObjectUrl)
                }
                
                // remove wrapper has-previewImage class
                if(commentPreviewImagesDeleteEle){
                    const commentImagePreviewWrapper = document.querySelector('.comment-image-preview-wrapper.has-previewImage')
                    
                    commentImagePreviewWrapper.classList.remove('has-previewImage')
                }   
            }
        })
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// comment image on comment ////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    const commentPreviewImagesDeleteCommentEle = document.querySelectorAll('.comment-preview-images-delete-comment')

    if(commentPreviewImagesDeleteCommentEle && commentPreviewImagesDeleteCommentEle.length !== 0){
        commentPreviewImagesDeleteCommentEle.forEach(ele=>{
            ele.onclick = event => {  
        
                const commentImageContentInputBtn = ele.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling
                commentImageContentInputBtn.value = ""
                commentImageOnCommentReadyForUploading = ""
    
                // clear space of write-comment-wrapper
                const writeCommentWrapperEle = ele.parentNode.parentNode
                writeCommentWrapperEle.style.gridTemplateRows = "";
    
                // clear preview eles
                const commentDeletedImageEle = ele.nextElementSibling
                const removedElementList = [ele, commentDeletedImageEle]
                            
                if(removedElementList.length !== 0){
                    removedElementList.forEach(ele=>{
                        ele.remove();
                    })
                }
    
                // revoke ObjectURL
                const urlSliced = commentDeletedImageEle.src.slice(0, 4)
                if(urlSliced && urlSliced === 'blob'){
                    const blobObjectUrl = commentDeletedImageEle.src
                    URL.revokeObjectURL(blobObjectUrl)
                }
                
                // remove wrapper has-previewImage class
                if(commentPreviewImagesDeleteEle){
                    const commentImagePreviewWrapper = document.querySelector('.comment-image-preview-wrapper-comment.has-previewImage')
                    
                    commentImagePreviewWrapper.classList.remove('has-previewImage')
                }   
            }
        })
    }
    
}
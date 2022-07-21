"use strict"

//add preview
let imagesReadyForUploading = []

function addPreviews(imageContentInputBtn){

    const imagePreviewWrapper = document.querySelector('.image-preview-wrapper')
    
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
        


}

// delete preview of images would be uploaded later 
function deletePreviews(event, args){

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
        const originalImagesEle = args.originalImagesEle
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
                const imageContentInputBtn = args.imageContentInputBtn
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
}
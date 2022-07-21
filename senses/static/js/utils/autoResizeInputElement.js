"use strict"

const autoResizeInputElement = () =>{

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = getComputedStyle(event.target).font
    const inputTextWidth = context.measureText(event.target.value).width
    const inputTextHeight = parseInt(context.font)
    const inputClientWidth = (event.target.clientWidth)-20 // minus the left/right padding

    event.target.style.height = inputTextWidth < inputClientWidth ?
        '30px'
        :
        (30 + (Math.ceil(inputTextWidth/inputClientWidth)) * inputTextHeight) + 'px'

}

"use strict"

const debounce = function(func, delay){
    let timer;
    return function(){     
        const context = this; 
        const args = arguments;

        clearTimeout(timer); 

        timer = setTimeout(()=> {
        func.apply(context, args)
        },delay);
    }
}

class Scroll{

    page
    keyword = ""

    renderMessage = () => {

        // clear stories-block-endmessage
        const storiesBlockEndmessage = document.querySelectorAll('.stories-block-endmessage')
        if(storiesBlockEndmessage && storiesBlockEndmessage.length === 0){
            const storiesBlock = document.querySelectorAll('.stories-block')
            storiesBlock.forEach(block=>{
                const html = `
                                <div class="stories-block-endmessage">已經到底囉～！</div>
                            `
                block.insertAdjacentHTML('beforeend', html)
            })
        }

    }

    renderContent = () => {
        
        if(this.page !== null){
            renderWholeStoryPage(this.page, this.keyword) // function from story.js
        } else if (currentPathnameSplitted[1] === 'stories' && !currentPathnameSplitted[2] || currentPathnameSplitted[2] === 'profile') {
            this.renderMessage()
        }

    }
    
    scrolling = ()=>{
        if ((window.innerHeight + Math.floor(window.scrollY)) - document.body.offsetHeight >= -200){
            this.renderContent()
        };     
    }
}

// add listener for scrolling
const scroll = new Scroll()
window.addEventListener('scroll', debounce(scroll.scrolling, 300))

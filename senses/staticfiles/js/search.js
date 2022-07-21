"use strict"

class Search{
    constructor(){
        this.url = 'http://127.0.0.1:8000/'
    }

    clickSearchIcon(){
        document.querySelector('.search-icon').setAttribute('onClick', 'Search.startSearching()');
        document.querySelector('.search-icon').classList.add('has-click');    
    }

    startSearching(){
        return true
    }
}

document.querySelector('.search-bar').addEventListener('focus', ()=>{
    let search = new Search
    search.clickSearchIcon()
    document.querySelector('.search-icon.has-click').src = search.url+'static/images/icons/search_after.png'
    if (document.querySelector('.search-bar') !== document.activeElement){
        document.querySelector('.search-icon.has-click').classList.remove('has-click')
    }
})




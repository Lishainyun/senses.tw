"use strict"

class User {

    #password;
    userListApiUrl = 'http://127.0.0.1:8000/api/users/';
    userApiUrl = 'http://127.0.0.1:8000/api/user/';
    userTokenApiUrl = 'http://127.0.0.1:8000/api/user/token'

    constructor(email, password){
        this.email = email;
        this.#password = password;
    };

    // 驗證email格式是否符合要求
    isValidEmailFormat(){

        const emailRegEx = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/ ;
        
        if(this.email.search(emailRegEx) !== -1){
            return true
        }; 

    };

    // 驗證password格式是否符合要求
    isValidPasswordFormat(){

        let hasNum = /\d/;

        if(hasNum.test(this.#password) && this.#password.length >= 8){
            return true
        };

    };

    async getToken(){

        let headers = {
            'Content-Type': 'application/json'
        };

        let body = {
            'email': this.email,
            'password': this.#password
        }

        const response = await fetch(this.userTokenApiUrl, {

            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(body),
            
        })

        return await response.json()

    }

    async loginUser(){
        this.getToken()
            .then(response=>{

                let token = response.access

                if(token){

                    localStorage.setItem('token', token)
                    window.location.href = `http://127.0.0.1:8000/stories` 

                } else{
                    if(loginPage === 'login'){
                        let errorMessageBeforeLoginBtn = document.querySelector('.error-message-before-login-btn')
                        let insertedEle = document.querySelector('.submit-button')
                        let errorMessage = "帳號或密碼輸入錯誤"
                        console.log(errorMessageBeforeLoginBtn)

                        if(errorMessageBeforeLoginBtn === null){
                            const errorMessageHtml = `<div class="error-message-before-login-btn">${errorMessage}</div>` 
                            insertedEle.insertAdjacentHTML('beforebegin', errorMessageHtml)
                        }

                        if(errorMessageBeforeLoginBtn.innerHTML === ""){
                            errorMessageBeforeLoginBtn.innerHTML = errorMessage

                        }

                    }
                }
            }).catch(error=>{
                console.log(error)
            })
        
    }

    async logoutUser(){

        const logoutBtn = document.querySelectorAll('.logout')
                        
        logoutBtn.forEach(ele=>{
            ele.addEventListener('click', ()=>{
                localStorage.clear()
                location.href = "/user/login"
            })
        })

    }

    async renderErrorMessage(errorInputEles, errorMessage){

        errorInputEles.forEach(ele=>{

            const errorMessageHtml = `<span class="error-message">${errorMessage[`${ele.type}`]}</span>` 
            ele.insertAdjacentHTML('afterend', errorMessageHtml)
    
        })

    }

};

const user = new User()

/* ///////////////////////////////////////////////////////////
[listener for email input to check if valid] /////////// */
const emailInputElement = document.getElementById("email");
if(emailInputElement){
    emailInputElement.addEventListener('input',()=>{

        let email = emailInputElement.value;
        const user = new User(email, "empty");

        if(user.isValidEmailFormat()){
            emailInputElement.classList.add('is-valid');
            emailInputElement.classList.remove('is-invalid');
        } else {
            emailInputElement.classList.remove('is-valid');
            emailInputElement.classList.add('is-invalid');
        };

    });
}

/* ///////////////////////////////////////////////////////////
[listener for password input to check if valid] /////////// */
const passwordInputElements = document.querySelectorAll('.passwordInput');
if(passwordInputElements){
    passwordInputElements.forEach(input=>{
        input.addEventListener('input',()=>{

            let password = input.value;
            const user = new User("empty", password=password);

            if(user.isValidPasswordFormat()){
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
            } else {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
            };

        });
    });
}

/* ///////////////////////////////////////////////////////////
[listener for login submit button] /////////// */
const loginSubmitBtn = document.querySelector('.submit-button');

function login(){

    let emailInputEle = document.querySelector('.emailInput');
    let emailInputValue = document.querySelector('.emailInput').value;

    let passwordInputEle = document.querySelector('.passwordInput');
    let passwordInputValue = document.querySelector('.passwordInput').value;

    let loginInputEles = [emailInputEle, passwordInputEle]
    let errorInputEles = []
    let errorMessage = {}

    const user = new User(emailInputValue, passwordInputValue);

    // get specific label name
    let loginInputLableEles = document.getElementsByTagName('label')
    let labelName;

    const findLabelForSpecificInputName = (ele)=>{

        Array.from(loginInputLableEles).forEach(label=>{
            if(label.htmlFor === ele.name){
                labelName = label.textContent
            }
        })       

    }
    
    // clean existed error messages before rendering new ones
    let errorMessageEles = document.querySelectorAll('.error-message')
    errorMessageEles.forEach(ele=>{
        ele.remove()
    })

    // check input validity
    if(loginPage === 'login'){
        loginInputEles.forEach(ele=>{

            if(!ele.value){
                findLabelForSpecificInputName(ele)
                errorMessage[`${ele.type}`] = "您尚未輸入" + labelName
                errorInputEles.push(ele) 
            } else{
                if(ele.classList.contains('is-invalid')){
                    findLabelForSpecificInputName(ele)
                    errorMessage[`${ele.type}`] = "您輸入無效的" + labelName
                    errorInputEles.push(ele) 
                }
            }

        })
    }

    if(errorInputEles.length !==0){

        // if errorMessageBeforeLoginBtn already exist, clear it.
        let errorMessageBeforeLoginBtn = document.querySelector('.error-message-before-login-btn')

        if(errorMessageBeforeLoginBtn){
            errorMessageBeforeLoginBtn.innerHTML = ""
        }

        user.renderErrorMessage(errorInputEles, errorMessage)

    } else {

        user.loginUser()

    }
}

if(loginSubmitBtn){

    loginSubmitBtn.addEventListener('click', login)
    document.addEventListener('keyup', (e)=>{
        
        e.preventDefault()

        if(e.key === 'Enter'){
            login()
        }
    })

}

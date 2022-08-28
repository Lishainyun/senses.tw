"use strict"

const currentPathname = window.location.pathname
const currentPathnameSplitted = currentPathname.split('/')
const loginPage = currentPathname.split('/').at(2)
const usernameOfCurrentPathname = currentPathnameSplitted.at(-1)
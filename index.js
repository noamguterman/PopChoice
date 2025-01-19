import main from './logic.js'

const form = document.querySelector('form')
const resultDiv = document.getElementsByClassName('result')[0]

document.getElementById('submit-btn').addEventListener('click', handleSubmit)
document.getElementById('restart-btn').addEventListener('click', handleRestart)

async function renderResult(input) {
    const resultTextEl = document.getElementById('ai-output')
    const restartBtn = document.getElementById('restart-btn')
    const resultTitle = document.getElementById('result-title')
    
    resultTitle.classList.add('hide')
    restartBtn.classList.add('hide')
    resultTextEl.textContent = 'Loading...'
    resultTextEl.textContent = await main(input)
    resultTitle.classList.remove('hide')
    restartBtn.classList.remove('hide')
}

function handleSubmit(e) {
    e.preventDefault()
    
    const userFav = document.getElementById('fav')
    const userMood = document.getElementById('mood')
    const userFun = document.getElementById('fun')
    const userFullInput = `
        Favorite movie: ${userFav.value} 
        How old/new I want the movie to be: ${userMood.value} 
        How fun/serious I want the movie to be: ${userFun.value}
    `
    const invalidFormMsg = document.getElementById('invalidFormMsg')
    
    if (!userFav.value || !userMood.value || !userFun.value) {
        invalidFormMsg.classList.remove('hide')
    } else {
        renderResult(userFullInput)
        
        userFav.value = ''
        userMood.value = ''
        userFun.value = ''
        form.classList.add('hide')
        resultDiv.classList.remove('hide')
    }
}

function handleRestart() { 
    resultDiv.classList.add('hide')
    form.classList.remove('hide')
}
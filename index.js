const form = document.querySelector('form')
const resultDiv = document.getElementsByClassName('result')[0]

document.getElementById('submit-btn').addEventListener('click', handleSubmit)
document.getElementById('restart-btn').addEventListener('click', handleRestart)

async function main(input) {
    try {
        const response = await fetch('https://popchoice-worker.noamguterman.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: input })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Error:', error);
        return 'Sorry, there was an error getting your movie recommendation. Please try again.';
    }
}

async function renderResult(input) {
    const resultTextEl = document.getElementById('ai-output')
    const restartBtn = document.getElementById('restart-btn')
    const resultTitle = document.getElementById('result-title')
    
    resultTitle.classList.add('hide')
    restartBtn.classList.add('hide')
    resultTextEl.textContent = 'Loading...'
    
    try {
        resultTextEl.textContent = await main(input)
    } catch (error) {
        resultTextEl.textContent = 'Sorry, there was an error. Please try again.'
    } finally {
        resultTitle.classList.remove('hide')
        restartBtn.classList.remove('hide')
    }
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
        invalidFormMsg.classList.add('hide')
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
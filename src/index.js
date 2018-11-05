import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pond-client.glitch.me/'
})

// Axios Interceptor - 그때그때 다른 설정 사용하기
// axios에는 매번 요청이 일어나기 직전에 **설정 객체를 가로채서** 원하는대로 편집할 수 있는 기능이 있습니다.
// localStorage에 토큰이 저장되어 있으면, 요청에 토큰을 포함시키고
// localStorage에 토큰이 없으면, 요청에 토큰을 포함시키지 않는다.
api.interceptors.request.use(function (config) {
  // localStorage에 token이 있으면 요청에 헤더 설정, 없으면 아무것도 하지 않음
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  todoList: document.querySelector('#todo-list').content,
  todoItem: document.querySelector('#todo-item').content
}

const rootEl = document.querySelector('.root')

function drawLoginForm() {
  // 1. 템플릿 복사하기
  const fragment = document.importNode(templates.loginForm, true)

  // 2. 내용 채우고 이벤트 리스너 등록하기
  const loginFormEl = fragment.querySelector('.login-form')

  loginFormEl.addEventListener('submit', async e => {
    e.preventDefault()
    // e: 이벤트 객체
    // e.target: 이벤트를 실제로 일으킨 요소 객체(여기선 loginFormEl)
    // e.target.elements: 폼 내부에 들어있는 요소 객체를 편하게 가져올 수 있는 특이한 객체
    // e.target.elements.username: 폼 내부에 들어 있는 요소들 중 name 속성값이 "username"인 요소 객체
    // e.target.elements.username.value: 사용자가 요소 객체에 입력한 값
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username: username,
      password: password
    })
    localStorage.setItem('token', res.data.token)

    // 로그인 후 할일 목록을 표시해 준다.
    drawTodoList()
  })

  // 3. 문서 내부에 삽입하기
  rootEl.appendChild(fragment)
}

async function drawTodoList() {
  // 할 일 목록을 받아와서 저장한다.
  const res = await api.get('/todos')
  const list = res.data

  // 1. 템플릿 복사하기
  const fragment = document.importNode(templates.todoList, true)
  // 2. 내용 채우고 이벤트 리스너 등록하기
  const todoListEl = fragment.querySelector('.todo-list')

  // 배열에 들어있는 데이터를 todoItem fragment에 넣어주기 위해 forEach문을 돌려준다.
  list.forEach(todoItem => {
    // 1. 템플릿 복사하기
    const fragment = document.importNode(templates.todoItem, true)
    // 2. 내용 채우고 이벤트 리스너 등록하기
    const bodyEl = fragment.querySelector('.body')
    bodyEl.textContent = todoItem.body
    // 3. 문서 내부에 삽입하기
    todoListEl.appendChild(fragment)
  })

  // 3. 문서 내부에 삽입하기
  // 먼저 비우고 새로 삽입한다.
  rootEl.textContent = ''
  rootEl.appendChild(fragment)
}

drawLoginForm()
// drawTodoList()

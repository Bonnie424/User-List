const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const cardContainer = document.querySelector("#user-container");
const pagination = document.querySelector(".pagination");




const userList = JSON.parse(localStorage.getItem('friends')) || []
const USERS_PER_PAGE = 12
let filterUserList = []

// gender icon
const femaleIcon = '<i class="fa-solid fa-person-dress fa-lg" style="color: #ee8181;"></i>';
const maleIcon = '<i class="fa-solid fa-person fa-lg" style="color: #74C0FC;"></i>';
// Function icon
const addFriendIcon = '<i class="fa-solid fa-user-plus fa-beat fa-2xl add-friend-icon" style="color: #024059;"></i>'
const removeFriendIcon = '<i class="fa-solid fa-user-minus fa-beat fa-2xl remove-friend-icon" style="color: #024059;"></i>'




cardContainer.addEventListener("click", (event) => {
  const target = event.target.closest('.user-card');
  const id = target.dataset.id;
  if (target) {
    showUserModal(id);
  }
});


// 分頁器
pagination.addEventListener('click', event => {
  const target = event.target;

  if (target.tagName !== 'A') return

  const page = target.dataset.page
  const pagenationItems = document.querySelectorAll('.page-link')
  pagenationItems.forEach(item => {
    if (item.classList.contains('active')) {
      item.classList.remove('active');
    }
  })
  target.classList.add('active')
  renderUserList(getUsersByPage(page))

})


renderPaginator(userList.length)
renderUserList(getUsersByPage(1))



// 渲染頁面
function renderUserList(data) {
  let cardHTML = "";
  data.forEach((user) => {
    const genderIcon = user.gender === "female" ? femaleIcon : maleIcon;
    const imgHTML = `<img src="${user.avatar}" class="card-img-top" alt="user-avatar" onerror="handleImageError(this)">`;

    cardHTML += ` 
      <div class="card user-card" style="width: 18rem;" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">
        ${imgHTML}
        <div class="card-body">
          <p class="card-text">
            ${user.name + user.surname} ${genderIcon} <!-- 添加性別圖示 -->
          </p>
        </div>
      </div>`;
  });

  cardContainer.innerHTML = cardHTML;

}

function handleImageError(imgElement) {
  imgElement.onerror = null; // 避免無限遞迴
  imgElement.src = ""; // 清空圖片 src
  imgElement.alt = "該用戶沒放置個人頭像"; // 修改圖片 alt 文字
}



// 渲染分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)

  let rawHTML = ""
  rawHTML += `<li class="page-item"><a class="page-link active" data-page="1" href="#">1</a></li>`
  for (let page = 2; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" data-page="${page}" href="#">${page}</a></li>`
  }

  pagination.innerHTML = rawHTML
}

// 按照頁數取得user資料
function getUsersByPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  if (filterUserList.length > 0) {
    return filterUserList.slice(startIndex, startIndex + USERS_PER_PAGE)
  }
  return userList.slice(startIndex, startIndex + USERS_PER_PAGE)
}


function removeTofriend(id) {

  if (!userList || !userList.length) return

  const userIndex = userList.findIndex((user) => user.id === id)
  if (userIndex === -1) return

  userList.splice(userIndex, 1)

  localStorage.setItem('friends', JSON.stringify(userList))

  renderPaginator(userList.length)
  renderUserList(getUsersByPage(1))

  const closeButton = document.querySelector('.btn-close');
  closeButton.click();


}



function showUserModal(id) {
  const modalName = document.querySelector(".modal-user-name");
  const modalAvatar = document.querySelector(".modal-user-avatar");
  const modalUserInfo = document.querySelector(".modal-user-info");

  modalName.innerText = "";
  modalAvatar.src = "";
  modalUserInfo.innerText = "";

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data;

      modalName.innerText = `${data.name} ${data.surname} `
      modalAvatar.src = `${data.avatar}`;
      let rawString = ''
      rawString += `<p>email : ${data.email}</p>
        <p>gender : ${data.gender} </p>
        <p>age : ${data.age}</p>
        <p>region : ${data.region}</p>
        <p>birthday : ${data.birthday}</p>
        <div class="friend-button">${removeFriendIcon}</div>
        `;

      modalUserInfo.innerHTML = rawString


      // 為添加好友按鈕設置點擊事件觸發
      const friendButton = document.querySelector(".friend-button");

      friendButton.addEventListener("click", event => {
        const icon = friendButton.querySelector("i");
        // 判斷當前按鈕的狀態
        const isAdding = icon.classList.contains("fa-user-plus");

        if (isAdding) {
          // 添加好友
          icon.classList.toggle("fa-user-plus");
          icon.classList.toggle("fa-user-minus");
          // 點擊加好友後,把資料存在localStorage
          const friendList = JSON.parse(localStorage.getItem('friends')) || []
          friendList.push(data)
          localStorage.setItem('friends', JSON.stringify(friendList))

          // 顯示 "已添加至我的好友清單" 提示
          Swal.fire({
            title: "",
            text: "已添加至我的好友清單",
            icon: "success",
          });
        } else {
          // 刪除好友
          Swal.fire({
            title: "好友已在清單內",
            text: "確定要刪除好友嗎?",
            showCancelButton: true,
            confirmButtonText: "確定",
            cancelButtonText: "取消",
            icon: "question",
          }).then((result) => {
            if (result.isConfirmed) {
              // 確定刪除好友，切換圖標狀態
              icon.classList.toggle("fa-user-plus");
              icon.classList.toggle("fa-user-minus");
              removeTofriend(data.id)
              const friendList = JSON.parse(localStorage.getItem('friends')) || []
              friendList.pop(data)
              Swal.fire({
                title: "",
                text: "好友已刪除",
                icon: "success",
              });
            }
          });
        }
      });
    })
    .catch((error) => console.log(error));
}




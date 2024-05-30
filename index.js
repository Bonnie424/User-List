const BASE_URL = "https://user-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const cardContainer = document.querySelector("#user-container");
const pagination = document.querySelector(".pagination");
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const navLinks = document.querySelectorAll('.navbar-text');
const genderScreening = document.querySelector('.user-gender-screening')



let userList = [];
let filterUserList = []
const USERS_PER_PAGE = 12

// gender icon
const femaleIcon = '<i class="fa-solid fa-person-dress fa-lg" style="color: #ee8181;"></i>';
const maleIcon = '<i class="fa-solid fa-person fa-lg" style="color: #74C0FC;"></i>';
// Function icon
const addFriendIcon = '<i class="fa-solid fa-user-plus fa-beat fa-2xl add-friend-icon" style="color: #024059;"></i>'
const removeFriendIcon = '<i class="fa-solid fa-user-minus fa-beat fa-2xl remove-friend-icon" style="color: #024059;"></i>'




// 用戶性別篩選
genderScreening.addEventListener('click', event => {
  filterUserList = []
  const gender = event.target.dataset.gender; // 獲取所選性別
  userList.forEach(user => {
    if (gender === user.gender) {
      filterUserList.push(user)
    }
    renderPaginator(filterUserList.length)
    renderUserList(getUsersByPage(1))
  })

});




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


// 搜尋功能
searchForm.addEventListener('submit', event => {
  event.preventDefault() //停止預設行為
  const keyword = searchInput.value.trim().toLowerCase()
  filterUserList = []; // 清空 filterUserList
  if (keyword.length === 0) {
    return Swal.fire({
      title: "注意",
      text: "請輸入關鍵字搜尋",
      icon: "warning",
    });
  }
  userList.forEach(user => {
    if (user.name.toLowerCase().includes(keyword)) {
      filterUserList.push(user)
    }
  })

  if (filterUserList.length === 0) {
    return Swal.fire({
      title: "Sorry",
      text: "沒有符合您的搜尋項目",
      icon: "warning",
    });
  }
  renderPaginator(filterUserList.length)
  renderUserList(getUsersByPage(1))
})





// nav-bar
navLinks.forEach(link => {
  link.addEventListener('mouseover', event => {
    // 鼠標移入時修改文字顏色為 #45C4B0
    event.currentTarget.style.color = '#F3B562';
  });

  link.addEventListener('mouseout', event => {
    // 鼠標移出時恢復文字原來的顏色
    event.currentTarget.style.color = '#45C4B0';
  });
});

axios
  .get(INDEX_URL)
  .then((response) => {
    const amount = response.data.results.length
    renderPaginator(amount)
    userList.push(...response.data.results);
    renderUserList(getUsersByPage(1));
  })
  .catch((err) => console.log(err));


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


function addTofriend(id) {
  const list = JSON.parse(localStorage.getItem('friends')) || []
  const friend = userList.find(user => user.id === id)

  if (list.some(user => user.id === id)) {
    return
  }

  list.push(friend)

  localStorage.setItem('friends', JSON.stringify(list))
}

function removeTofriend(id) {
  const list = JSON.parse(localStorage.getItem('friends')) || [];
  const userIndex = list.findIndex((user) => user.id === id);

  if (userIndex === -1) return;
  list.splice(userIndex, 1);
  localStorage.setItem('friends', JSON.stringify(list));



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

      // 如果localStorage中有好友，顯示removeFriendIcon
      let friendBtn = addFriendIcon
      const friendList = JSON.parse(localStorage.getItem('friends')) || []
      friendList.find(friend => {
        if (friend.id === data.id) {
          friendBtn = removeFriendIcon
        }
      })
      modalName.innerText = `${data.name} ${data.surname} `
      modalAvatar.src = `${data.avatar}`;
      let rawString = ''
      rawString += `<p>email : ${data.email}</p>
        <p>gender : ${data.gender} </p>
        <p>age : ${data.age}</p>
        <p>region : ${data.region}</p>
        <p>birthday : ${data.birthday}</p>
        <div class="friend-button">${friendBtn}</div>
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
          addTofriend(data.id)
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





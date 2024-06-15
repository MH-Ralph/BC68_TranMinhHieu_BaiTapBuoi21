const btnAdd = document.getElementById("btnThemNV");
const btnUpdate = document.getElementById("btnCapNhat");
// Khai báo danh sách nhân viên
let listEmploy = [];

// GỌI HÀM VALIDATOR
Validator({
  form: "#form-1",
  errorSelector: ".sp-thongbao",
  parentBlock: ".form-group",
  buttonAdd: "#btnThemNV",
  buttonUpdate: "#btnCapNhat",
  rules: [
    Validator.isRequired("#tknv"),
    Validator.isAccount("#tknv"),
    Validator.isRequired("#name"),
    Validator.isName("#name"),
    Validator.isRequired("#email"),
    Validator.isEmail("#email"),
    Validator.isRequired("#luongCB"),
    Validator.isNumber(
      "#luongCB",
      1000000,
      20000000,
      "Vui lòng nhập lương trong khoảng từ 1 triệu đến 20 triệu"
    ),
    Validator.isRequired("#password"),
    Validator.isPassword("#password"),
    Validator.minMaxLength("#password", 6, 10),
    Validator.isRequired("#chucvu"),
    Validator.isRequired("#gioLam"),
    Validator.isNumber(
      "#gioLam",
      80,
      200,
      "Vui lòng nhập giờ trong khoảng từ 80 giờ đến 200 giờ"
    ),
  ],
  // PHƯƠNG THỨC THÊM NHÂN VIÊN
  onSubmit: function (employee) {
    // Đã validate và nhận về nhân viên
    console.log(employee);

    // Kiểm tra xem tài khoản nhân viên đã tồn tại hay chưa.
    let isValid = listEmploy.find((nhanvien) => {
      return nhanvien.tknv.includes(employee.tknv);
    });

    // Nếu tồn tại nhân viên và tài khoản nhân viên chưa tồn tại.
    if (employee && !isValid) {
      // Thêm nhân viên vào list
      listEmploy.push(employee);

      // Lưu vào storage
      saveLocalStorage();

      // Lấy giữ liệu từ storage
      getLocalStorage();

      // Thông báo thành công
      Notification("Thêm nhân viên thành công");
      document.querySelectorAll("#form-1 [name]").forEach((item) => {
        item.value = "";
      });
    } else {
      // Thông báo thất bại
      Notification("Tài khoản nhân viên đã tồn tại");
    }
  },
  // PHƯƠNG THỨC UPDATE
  onUpdate: function (employee) {
    // Đã validate và nhận về nhân viên
    console.log(employee);

    // Tìm vị trí employee nằm trong listEmploy
    let index = listEmploy.findIndex((nhanvien) => {
      return nhanvien.tknv == employee.tknv;
    });

    if (index != -1) {
      listEmploy[index] = employee;

      //  Ẩn modal
      document.querySelector("#myModal").classList.remove("show");
      document.querySelector("#myModal").style.display = "block";
      document.querySelector(".modal-backdrop").classList.remove("show");
      document.querySelector("body").classList.remove("modal-open");

      // Thông báo thành công
      Notification("Cập nhật thành công");
      // render và lưu vào localStorage
      renderNhanVien();
      saveLocalStorage();

      document.querySelectorAll("#form-1 [name]").forEach((item) => {
        item.value = "";
      });
    } else {
      Notification("Nhân viên không tồn tại!");
    }
  },
});

function start() {
  // Lấy danh sách và render ra html
  getLocalStorage();

  // Search
  handleEvent();
}

start();

function handleEvent() {
  // XỬ LÍ CHỨC NĂNG SEARCH
  document.getElementById("searchName").oninput = (event) => {
    console.log(event.target.value);
    // convert dữ liệu trược khi lọc ==> chuyển về chữ thường (toLowerCase)
    // Loại bỏ dấu tiếng việt ==> Loại bỏ khoảng trắng
    let newKeyWord = removeVietnameseTones(
      event.target.value.toLowerCase().trim()
    );

    let listEmployFilter = listEmploy.filter((nhanvien) => {
      let xepLoai = checkXepLoai(nhanvien.gioLam);
      let newxepLoai = removeVietnameseTones(xepLoai.toLowerCase().trim());
      return newxepLoai.includes(newKeyWord);
    });

    renderNhanVien(listEmployFilter);
  };
}

function saveLocalStorage(key = "listEmploy", value = listEmploy) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getLocalStorage(key = "listEmploy") {
  listEmploy = JSON.parse(localStorage.getItem(key)) || [];
  renderNhanVien();
}

// HÀM RENDER NHÂN VIÊN
function renderNhanVien(list = listEmploy) {
  let listBlock = document.getElementById("tableDanhSach");

  let htmls = list.map((employee) => {
    let { tknv, name, email, password, datepicker, luongCB, chucvu, gioLam } =
      employee;
    let tongLuong = checkChucVu(chucvu, luongCB);
    let xepLoai = checkXepLoai(gioLam);

    return `
        <tr>
            <td>${tknv}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${datepicker}</td>
            <td>${chucvu}</td>
            <td>${tongLuong}</td>
            <td>${xepLoai}</td>
            <td>
                <button class ="btn btn-danger mb-2" onclick= "deleteNhanVien('${tknv}')">Xóa</button>
                <button class ="btn btn-primary" data-toggle="modal" data-target="#myModal" onclick= "getInfoNhanVien('${tknv}')" >Sửa</button>
            </td>
        </tr>
    `;
  });

  listBlock.innerHTML = htmls.join(" ");
}

// HÀM XÓA NHÂN VIÊN
function deleteNhanVien(id) {
  let index = listEmploy.findIndex((nhanvien) => {
    return nhanvien.tknv === id;
  });

  // Hiển thị hộp thoại xác nhận
  var userConfirmed = confirm("Bạn có chắc chắn muốn xóa nhân viên này?");

  if (userConfirmed) {
    // Người dùng nhấn "OK"
    listEmploy.splice(index, 1);
    saveLocalStorage();
    getLocalStorage();

    // Thông báo thành công
    Notification("Xóa thành công");
  }
}

// HÀM LẤY THÔNG TIN NHÂN VIÊN
function getInfoNhanVien(id) {
  const arrField = document.querySelectorAll(
    ".form-block .form-group input, .form-block .form-group select"
  );

  let nhanVien = listEmploy.find((nhanvien) => {
    return nhanvien.tknv == id;
  });

  arrField.forEach((field) => {
    field.value = nhanVien[field.id];
  });
}

// HÀM TÍNH TỔNG LƯƠNG
function checkChucVu(chucvu, luongCB) {
  let tongLuong;
  switch (chucvu) {
    case "Sếp":
      tongLuong = luongCB * 3;
      break;
    case "Trưởng phòng":
      tongLuong = luongCB * 2;
      break;
    case "Nhân viên":
      tongLuong = luongCB;
      break;
    default:
      tongLuong = 0;
      break;
  }
  return tongLuong;
}

// HÀM KIỂM TRA XẾP LOẠI NHÂN VIÊN
function checkXepLoai(gioLam) {
  let xepLoai;
  if (gioLam >= 192) {
    xepLoai = "Nhân viên xuất sắc";
  } else if (gioLam >= 176) {
    xepLoai = "Nhân viên giỏi";
  } else if (gioLam >= 160) {
    xepLoai = "Nhân viên khá";
  } else {
    xepLoai = "Nhân viên trung bình";
  }
  return xepLoai;
}

// HÀM HIỂN THỊ THÔNG BÁO
function Notification(text, duration = 3000) {
  Toastify({
    text,
    duration,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

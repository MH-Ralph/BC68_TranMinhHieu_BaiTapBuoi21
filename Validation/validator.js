function Validator(options) {
  let selectorRules = {};

  // Hàm thực hiện validate
  function validate(inputElement, errorElement, rule) {
    // value: inputElement.value
    // test func: rule.test
    let errorMessage;

    // Lấy ra các rules của selector
    let rules = selectorRules[rule.selector];

    // Lặp qua từng rule & kiểm tra
    // Nếu có lỗi thì dừng việc kiểm tra
    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }
    // Xử lí khi có lỗi
    if (errorMessage) {
      errorElement.style.display = "block";
      errorElement.innerText = errorMessage;
    } else {
      errorElement.innerText = "";
      errorElement.style.display = "none";
    }

    return !errorMessage;
  }

  // Lấy element của form cần validate
  let formElement = document.querySelector(options.form);
  if (formElement) {
    // Thêm
    let btnAdd = document.querySelector(options.buttonAdd);
    btnAdd.onclick = () => {
      let isFormValid = true;
      // Lặp qua từng rule và validate luon
      options.rules.forEach((rule) => {
        let inputElement = formElement.querySelector(rule.selector);
        let errorElement = inputElement
          .closest(options.parentBlock)
          .querySelector(options.errorSelector);
        let isValid = validate(inputElement, errorElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onSubmit === "function") {
          let enableInputs = formElement.querySelectorAll("[name]");

          let formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.id] = input.value;
            return values;
          }, {});

          options.onSubmit(formValues);
        }
      } else {
        console.log("Có lỗi");
      }
    };

    // Sửa
    let btnUpdate = document.querySelector(options.buttonUpdate);
    btnUpdate.onclick = () => {
      let isFormValid = true;
      // Lặp qua từng rule và validate luon
      options.rules.forEach((rule) => {
        let inputElement = formElement.querySelector(rule.selector);
        let errorElement = inputElement
          .closest(options.parentBlock)
          .querySelector(options.errorSelector);
        let isValid = validate(inputElement, errorElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        if (typeof options.onUpdate === "function") {
          let enableInputs = formElement.querySelectorAll("[name]");

          let formValues = Array.from(enableInputs).reduce((values, input) => {
            values[input.id] = input.value;
            return values;
          }, {});

          options.onUpdate(formValues);
        }
      } else {
        console.log("Có lỗi");
      }
    };

    // Lặp qua rules và lắng nghe sự kiên onblur, oninput...
    options.rules.forEach((rule) => {
      // Lưa lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      let inputElement = formElement.querySelector(rule.selector);
      // Lấy ra thể cha và query đến thẻ span error
      let errorElement = inputElement
        .closest(options.parentBlock)
        .querySelector(options.errorSelector);

      if (inputElement) {
        // Lắng nghe sự kiện onblur
        inputElement.onblur = () => {
          validate(inputElement, errorElement, rule);
        };

        // Lắng nghe sự kiện oninput
        inputElement.oninput = () => {
          errorElement.innerText = "";
          errorElement.style.display = "none";
        };
      }
    });
  }
}

// Định nghĩa các rules
// Nguyên tắc của các rules
// 1. Khi có lỗi => trả ra mess lỗi
// 2. Khi không lỗi => không trả gì hết
Validator.isRequired = (selector, message) => {
  return {
    selector,
    test: function (value) {
      return value.trim() ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector,
    test: function (value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Trường này phải là email";
    },
  };
};

Validator.isAccount = (selector, message) => {
  return {
    selector,
    test: function (value) {
      let regex = /^[0-9]{4,6}$/;
      return regex.test(value)
        ? undefined
        : message || "Tài khoản phải chứa từ 4 đến 6 ký số.";
    },
  };
};

Validator.isName = (selector, message) => {
  return {
    selector,
    test: function (value) {
      let regex = /^[A-Za-z\sÀ-Ỹà-ỹ]+$/;
      return regex.test(value)
        ? undefined
        : message || "Tên nhân viên phải là chữ";
    },
  };
};

Validator.isPassword = (selector, message) => {
  return {
    selector,
    test: function (value) {
      let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      return regex.test(value)
        ? undefined
        : message ||
            "Mật khẩu chứa ít nhất 1 ký tự số, 1 ký tự in hoa, 1 ký tự đặc biệt";
    },
  };
};

Validator.minMaxLength = (selector, min, max, message) => {
  return {
    selector,
    test: function (value) {
      return min <= value.length && value.length <= max
        ? undefined
        : message || `Vui lòng nhập dữ liệu trong khoảng từ ${min} đến ${max} `;
    },
  };
};

Validator.isNumber = (selector, min, max, message) => {
  return {
    selector,
    test: function (value) {
      return min <= Number(value) && Number(value) <= max
        ? undefined
        : message || `Vui lòng nhập số trong khoảng từ ${min} đến ${max} `;
    },
  };
};

Validator.isConfirmed = (selector, getConfirmValue, message) => {
  return {
    selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
